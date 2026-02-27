import fs from "fs";
import express from "express";
import path from "path";
import multer from "multer";
import { serverDb, localDb, initSchemas } from "../helpers/db-manager.js";
import { config } from "../config/index.js";
import { mainCategoriesCache, summaryDataCache, hydrateCaches } from "../data/cache/index.js";

const router = express.Router();
const CONTENT_DIR = config.paths.content;
const DEFAULT_ROOT = config.defaults.customContentRoot;

// Initialize schemas and caches
await initSchemas();
await hydrateCaches();

// Multer storage for custom content
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { path: relPath } = req.body;
        const safePath = (relPath || DEFAULT_ROOT).replace(/^\/+|\/+$/g, "");
        const fullPath = safePath.startsWith(DEFAULT_ROOT) ? safePath : path.posix.join(DEFAULT_ROOT, safePath);
        const dest = path.join(CONTENT_DIR, fullPath);
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// Multer storage for specialized assets (thumbnails, videos, pdfs)
const assetStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { type } = req.body;
        const subDir = type === 'thumbnail' ? 'thumbnails' : (type === 'video' ? 'videos' : 'resources');
        const dest = path.join(CONTENT_DIR, DEFAULT_ROOT, 'assets', subDir);
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).toLowerCase().replace(/\s+/g, '-');
        cb(null, `${Date.now()}-${name}${ext}`);
    }
});
const assetUpload = multer({ storage: assetStorage });

// --- Content Discovery Routes ---

router.get("/main-categories", (req, res) => {
    res.json(mainCategoriesCache);
});

router.get("/levels/summary", (req, res) => {
    res.json(summaryDataCache);
});

router.get("/custom-content/summary", (req, res) => {
    try {
        const DEFAULT_THUMBNAIL = config.defaults.thumbnail;

        const allCategories = localDb.prepare(`
            SELECT id, title, subtitle, path_key, parent_id, is_disabled, body, tags
            FROM categories
            WHERE is_disabled = 0
        `).all();
        const allContent = localDb.prepare(`
            SELECT id, category_id, title, subtitle, type, url, path_key, size, duration, pages, body, video_url, pdf_url, audio_url, thumbnail_url, tags
            FROM content_items
            WHERE is_disabled = 0
        `).all();

        const categoryMap = Object.fromEntries(allCategories.map(c => [c.id, c]));
        const contentMap = allContent.reduce((acc, item) => {
            if (!acc[item.category_id]) acc[item.category_id] = [];
            acc[item.category_id].push({
                id: item.id,
                slug: item.path_key,
                title: item.title,
                type: item.type,
                thumbnail: item.thumbnail_url || DEFAULT_THUMBNAIL,
                url: item.url.startsWith('/') ? item.url : `/${item.url}`,
                description: item.subtitle || `Description for ${item.title}`,
                body: item.body,
                video_url: item.video_url,
                pdf_url: item.pdf_url,
                audio_url: item.audio_url,
                thumbnail_url: item.thumbnail_url,
                tags: (() => {
                    try {
                        return item.tags ? JSON.parse(item.tags) : [];
                    } catch (e) {
                        return item.tags ? item.tags.split(',').map(t => t.trim()) : [];
                    }
                })(),
                duration: item.duration ? `${item.duration} min` : undefined,
                pages: item.pages || undefined
            });
            return acc;
        }, {});

        function buildCategoryJSON(catId) {
            const cat = categoryMap[catId];
            if (!cat) return null;
            const children = allCategories.filter(c => c.parent_id === catId && c.is_disabled === 0);
            const contentItems = contentMap[catId] || [];

            return {
                slug: cat.path_key,
                title: cat.title,
                subtitle: cat.subtitle || "",
                body: cat.body || "",
                isContentLevel: contentItems.length > 0,
                content: contentItems,
                items: children.map(child => ({
                    title: child.path_key.split('/').pop(),
                    slug: child.path_key,
                    image: DEFAULT_THUMBNAIL,
                    colorClass: "bg-gray-400"
                }))
            };
        }

        const summary = {};
        allCategories.forEach(cat => {
            summary[cat.path_key] = buildCategoryJSON(cat.id);
        });

        res.json(summary);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to get custom content summary" });
    }
});

router.get("/content/:slug", (req, res) => {
    const slug = req.params.slug;

    // 1. Try Custom Content (localDb)
    if (slug.startsWith(DEFAULT_ROOT + '/')) {
        let fileRow = localDb.prepare(`
            SELECT path_key, url FROM content_items WHERE path_key = ?
        `).get(slug);

        if (!fileRow) {
            fileRow = localDb.prepare(`
                SELECT path_key, url FROM content_items WHERE path_key = ? OR url = ?
            `).get(slug, `/${slug}`);
        }

        if (fileRow) {
            const filePath = path.join(CONTENT_DIR, fileRow.path_key);
            if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found on disk" });
            return res.sendFile(filePath);
        }
    }

    // 2. Try Managed Content (serverDb)
    const fileRow = serverDb.prepare(`
        SELECT path_key FROM content_items WHERE path_key = ?
    `).get(slug);

    if (fileRow) {
        const filePath = path.join(CONTENT_DIR, fileRow.path_key);
        if (fs.existsSync(filePath)) return res.sendFile(filePath);
    }

    res.status(404).json({ error: "Content not found" });
});

// --- Manager APIs (Custom Content) ---

function getCategoryByPath(pathKey) {
    return localDb.prepare(`
        SELECT id, title, subtitle, path_key, parent_id, is_disabled, body
        FROM categories WHERE path_key = ?
    `).get(pathKey);
}

function listChildren(categoryId) {
    const categories = localDb.prepare(`
        SELECT id, title, subtitle, path_key, is_disabled, body, tags
        FROM categories WHERE parent_id = ? ORDER BY title ASC
    `).all(categoryId);
    const items = localDb.prepare(`
        SELECT id, title, type, size, path_key, is_disabled, body, video_url, pdf_url, audio_url, thumbnail_url, tags
        FROM content_items WHERE category_id = ? ORDER BY title ASC
    `).all(categoryId);
    return { categories, items };
}

function breadcrumbsFor(pathKey) {
    const parts = pathKey.split("/").filter(Boolean);
    const crumbs = [];
    for (let i = 0; i < parts.length; i++) {
        const sub = parts.slice(0, i + 1).join("/");
        const row = getCategoryByPath(sub);
        if (row) crumbs.push({ name: row.title, path: row.path_key });
    }
    return crumbs;
}

router.get("/manager/list", (req, res) => {
    try {
        const pathParam = (req.query.path || DEFAULT_ROOT).toString().replace(/^\/+|\/+$/g, "");
        const fullPath = pathParam.startsWith(DEFAULT_ROOT) ? pathParam : path.posix.join(DEFAULT_ROOT, pathParam);
        const cat = getCategoryByPath(fullPath);

        if (!cat || !cat.path_key.startsWith(DEFAULT_ROOT)) {
            return res.status(cat ? 400 : 404).json({ error: cat ? "Out of allowed folders" : "Category not found" });
        }

        const data = listChildren(cat.id);
        res.json({
            path: cat.path_key,
            title: cat.title,
            category: cat, // Full category object including body
            breadcrumbs: breadcrumbsFor(cat.path_key),
            categories: data.categories,
            items: data.items
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to list folder" });
    }
});

router.post("/manager/create-folder", express.json(), (req, res) => {
    try {
        const { name, path: parentPath } = req.body || {};
        const safeParent = (parentPath || DEFAULT_ROOT).replace(/^\/+|\/+$/g, "");
        const fullParentPath = safeParent.startsWith(DEFAULT_ROOT) ? safeParent : path.posix.join(DEFAULT_ROOT, safeParent);

        if (!name) return res.status(400).json({ error: "Name is required" });

        const parent = getCategoryByPath(fullParentPath);
        if (!parent || !parent.path_key.startsWith(DEFAULT_ROOT)) return res.status(404).json({ error: "Invalid parent" });

        const newPathKey = path.posix.join(parent.path_key, name.trim().toLowerCase().replace(/\s+/g, "-"));
        if (localDb.prepare(`SELECT 1 FROM categories WHERE path_key = ?`).get(newPathKey)) {
            return res.status(409).json({ error: "Already exists" });
        }

        const info = localDb.prepare(`
            INSERT INTO categories (title, subtitle, parent_id, path_key, is_main, is_disabled)
            VALUES (?, ?, ?, ?, 0, 0)
        `).run(name, "", parent.id, newPathKey);

        fs.mkdirSync(path.join(CONTENT_DIR, newPathKey), { recursive: true });
        res.status(201).json({ id: info.lastInsertRowid, title: name, path_key: newPathKey });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create folder" });
    }
});

router.post("/manager/upload-asset", assetUpload.single("file"), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file provided" });

        const { type } = req.body;
        const subDir = type === 'thumbnail' ? 'thumbnails' : (type === 'video' ? 'videos' : 'resources');
        const relativePath = `/${DEFAULT_ROOT}/assets/${subDir}/${req.file.filename}`;

        res.status(201).json({
            ok: true,
            path: relativePath,
            filename: req.file.filename
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Asset upload failed" });
    }
});

router.post("/manager/upload", upload.single("file"), (req, res) => {
    try {
        const { path: relPath, type } = req.body;
        const safePath = (relPath || DEFAULT_ROOT).replace(/^\/+|\/+$/g, "");
        const fullPath = safePath.startsWith(DEFAULT_ROOT) ? safePath : path.posix.join(DEFAULT_ROOT, safePath);
        const parent = getCategoryByPath(fullPath);

        if (!parent || !parent.path_key.startsWith(DEFAULT_ROOT)) return res.status(404).json({ error: "Target not found" });
        if (!req.file) return res.status(400).json({ error: "No file" });

        const filename = req.file.originalname;
        const pathKey = path.posix.join(parent.path_key, filename);
        const physicalPath = path.join(CONTENT_DIR, pathKey);

        // Multer might have saved it elsewhere if config was different, but here it's consistent
        if (req.file.path !== physicalPath) {
            fs.mkdirSync(path.dirname(physicalPath), { recursive: true });
            fs.renameSync(req.file.path, physicalPath);
        }

        if (localDb.prepare(`SELECT 1 FROM content_items WHERE path_key = ?`).get(pathKey)) {
            if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
            return res.status(409).json({ error: "File exists" });
        }

        const stat = fs.statSync(physicalPath);
        const info = localDb.prepare(`
            INSERT INTO content_items (category_id, title, subtitle, type, url, path_key, size, duration, pages, is_disabled)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `).run(parent.id, filename.replace(/-/g, " "), "", (type || "book").toLowerCase(), `/${pathKey}`, pathKey, stat.size, null, null);

        res.status(201).json({ id: info.lastInsertRowid, title: filename, path_key: pathKey });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Upload failed" });
    }
});

router.patch("/manager/toggle", express.json(), (req, res) => {
    try {
        const { target, path_key, id, is_disabled } = req.body || {};
        const flag = is_disabled ? 1 : 0;

        if (target === "category") {
            const fullPath = (path_key || "").startsWith(DEFAULT_ROOT) ? path_key : path.posix.join(DEFAULT_ROOT, path_key || "");
            const cat = getCategoryByPath(fullPath);
            if (!cat || !cat.path_key.startsWith(DEFAULT_ROOT)) return res.status(404).json({ error: "Not found" });
            localDb.prepare(`UPDATE categories SET is_disabled = ? WHERE id = ?`).run(flag, cat.id);
        } else if (target === "content") {
            const row = id
                ? localDb.prepare(`SELECT id FROM content_items WHERE id = ?`).get(id)
                : localDb.prepare(`SELECT id FROM content_items WHERE path_key = ?`).get(path_key);
            if (!row) return res.status(404).json({ error: "Not found" });
            localDb.prepare(`UPDATE content_items SET is_disabled = ? WHERE id = ?`).run(flag, row.id);
        } else {
            return res.status(400).json({ error: "Invalid target" });
        }
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Toggle failed" });
    }
});

router.post("/manager/upsert-item", express.json(), (req, res) => {
    try {
        const { id, category_id, title, subtitle, body, type, video_url, pdf_url, audio_url, thumbnail_url, tags } = req.body;

        if (!category_id || !title) return res.status(400).json({ error: "Category ID and Title are required" });

        if (id) {
            // Update
            localDb.prepare(`
                UPDATE content_items 
                SET category_id = ?, title = ?, subtitle = ?, body = ?, type = ?, video_url = ?, pdf_url = ?, audio_url = ?, thumbnail_url = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(category_id, title, subtitle || "", body || "", type || "section", video_url || null, pdf_url || null, audio_url || null, thumbnail_url || null, tags || null, id);
            res.json({ ok: true, id });
        } else {
            // Create
            const pathKey = `custom-content/virtual/${Date.now()}-${title.toLowerCase().replace(/\s+/g, '-')}`;
            const info = localDb.prepare(`
                INSERT INTO content_items (category_id, title, subtitle, body, type, url, path_key, size, is_disabled, video_url, pdf_url, audio_url, thumbnail_url, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?)
            `).run(category_id, title, subtitle || "", body || "", type || "section", pathKey, pathKey, video_url || null, pdf_url || null, audio_url || null, thumbnail_url || null, tags || null);
            res.status(201).json({ ok: true, id: info.lastInsertRowid });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Upsert failed" });
    }
});

router.delete("/manager/delete-item/:id", (req, res) => {
    try {
        const { id } = req.params;
        localDb.prepare(`DELETE FROM content_items WHERE id = ?`).run(id);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Delete failed" });
    }
});

router.post("/manager/update-category-body", express.json(), (req, res) => {
    try {
        const { id, body } = req.body;
        if (!id) return res.status(400).json({ error: "Category ID is required" });

        localDb.prepare(`UPDATE categories SET body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(body || "", id);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Update category body failed" });
    }
});

router.use('/files', express.static(CONTENT_DIR));

export default router;
