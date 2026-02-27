import fs from "fs";
import path from "path";
import { serverDb } from "./db-manager.js";
import { config } from "../config/index.js";

const CONTENT_DIR = config.paths.rwandanEducation;

// --- category queries ---
const insertCategory = serverDb.prepare(`
  INSERT INTO categories (title, subtitle, parent_id, path_key, is_main, is_disabled, tags)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const getCategory = serverDb.prepare(`SELECT id FROM categories WHERE path_key = ?`);
const insertContent = serverDb.prepare(`
  INSERT INTO content_items
  (category_id, title, subtitle, type, url, path_key, size, duration, pages, is_disabled, video_url, pdf_url, tags)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const getContent = serverDb.prepare(`SELECT id FROM content_items WHERE path_key = ?`);

function ensureCategory(name, parentId = null, relativePath = "", isMain = false, isDisabled = false) {
  const row = getCategory.get(relativePath);
  if (row) return row.id;
  return insertCategory.run(
    name.replace(/-/g, " "),
    "",
    parentId,
    relativePath,
    isMain ? 1 : 0,
    isDisabled ? 1 : 0,
    ""
  ).lastInsertRowid;
}

function insertFileContent(file, categoryId, type, relativePath, filePath) {
  if (getContent.get(relativePath)) return; // skip existing

  const stat = fs.statSync(filePath);
  const metadataPath = filePath.replace(path.extname(filePath), ".json");
  let metadata = {};

  if (fs.existsSync(metadataPath)) {
    try {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    } catch (e) {
      console.error(`Error parsing metadata for ${file}:`, e);
    }
  }

  return insertContent.run(
    categoryId,
    metadata.title || file.replace(/-/g, " ").replace(/\.[^/.]+$/, "").replace(/^\w/, c => c.toUpperCase()),
    metadata.summary || metadata.description || `Description for ${file}`,
    type,
    metadata.url || `${relativePath}`,
    relativePath,
    stat.size,
    metadata.duration || null,
    metadata.pages || null,
    0,
    metadata.video_url || null,
    metadata.pdf_url || null,
    metadata.tags ? (Array.isArray(metadata.tags) ? metadata.tags.join(",") : metadata.tags) : null
  ).lastInsertRowid;
}

function scanFolder(dir, parentId = null, base = "") {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(base, entry.name);

    if (entry.isDirectory()) {
      const containsFiles = fs.readdirSync(fullPath).some(f => fs.statSync(path.join(fullPath, f)).isFile());

      const catId = ensureCategory(entry.name, parentId, relativePath);
      if (containsFiles) {
        const type = entry.name.toLowerCase();
        fs.readdirSync(fullPath, { withFileTypes: true })
          .filter(f => f.isFile())
          .forEach(f => insertFileContent(f.name, catId, type, path.join('rwandan-education', relativePath, f.name), path.join(fullPath, f.name)));
      } else {
        scanFolder(fullPath, catId, relativePath);
      }
    }
  }
}

function insertMainCategories() {
  // Current logic uses hardcoded main categories.
  const mainCategories = [
    {
      title: "Rwandan education",
      slug: "rwandan-education",
      items: [
        { title: "Nursery School", slug: "nursery-school-content" },
        { title: "Primary School", slug: "primary-school-content" },
        { title: "Secondary School", slug: "secondary-school-content" },
        { title: "University Level", slug: "university-content" },
      ]
    },
    {
      title: "International education",
      slug: "international-education",
      items: [
        { slug: "wikipedia", title: "Wikipedia" },
      ]
    },
  ];

  const topLevelFolders = fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name) : [];

  for (const mainCat of mainCategories) {
    const mainCatId = ensureCategory(mainCat.title, null, mainCat.slug, true, false);
    for (const item of mainCat.items) {
      const isDisabled = mainCat.slug === "rwandan-education" && !topLevelFolders.includes(item.slug);
      ensureCategory(item.title, mainCatId, `${mainCat.slug}/${item.slug}`, false, isDisabled);
    }
  }
}

export function deleteContentByPath(pathKey) {
  const deleteContent = serverDb.prepare(`
    DELETE FROM content_items 
    WHERE path_key = ? OR path_key LIKE ?
  `);
  deleteContent.run(pathKey, `${pathKey}/%`);

  const deleteCategories = serverDb.prepare(`
    DELETE FROM categories 
    WHERE path_key = ? OR path_key LIKE ?
  `);
  deleteCategories.run(pathKey, `${pathKey}/%`);
}

export async function loadContentIntoDB() {
  scanFolder(CONTENT_DIR);
  // Cleanup removed categories
  const toDelete = [
    'international-education/w3schools',
    'international-education/kolibri',
    'school-content'
  ];
  toDelete.forEach(pathKey => deleteContentByPath(pathKey));

  insertMainCategories();
}
