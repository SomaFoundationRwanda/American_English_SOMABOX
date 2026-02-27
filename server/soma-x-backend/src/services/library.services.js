import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

import EPub from 'epub';
import sharp from 'sharp';
import { pdfToPng } from 'pdf-to-png-converter';

import { serverDb } from '../helpers/db-manager.js';
import { config } from '../config/index.js';

const router = express.Router();
const CLOUD_URL = config.cloudUrl;
const LIBRARY_DIR = config.paths.library;
const COVERS_DIR = config.paths.libraryCovers;

// Ensure library and covers directory exists
if (!fs.existsSync(LIBRARY_DIR)) {
    fs.mkdirSync(LIBRARY_DIR, { recursive: true });
}
if (!fs.existsSync(COVERS_DIR)) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, LIBRARY_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueId = Date.now().toString();
        req.generatedId = uniqueId;
        cb(null, `${uniqueId}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.epub' || ext === '.pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only .epub and .pdf files are allowed'));
        }
    }
});

let downloadStatus = "init";
let downloading = false;

async function generateBookCover(filePath, bookId) {
    const isPdf = path.extname(filePath).toLowerCase() === '.pdf';
    const outputPath = path.join(COVERS_DIR, `${bookId}.avif`);

    if (isPdf) {
        try {
            const pngPages = await pdfToPng(filePath, {
                pagesToProcess: [1],
                viewportScale: 2.0
            });

            if (pngPages.length > 0) {
                await sharp(pngPages[0].content)
                    .resize({ height: 800, withoutEnlargement: true })
                    .avif({ quality: 45 })
                    .toFile(outputPath);
                console.log(` Generated cover for PDF book: ${bookId}`);
                return true;
            }
            return false;
        } catch (err) {
            console.error(` PDF Cover generation error for book ${bookId}:`, err.message);
            return false;
        }
    }

    return new Promise((resolve) => {
        const epub = new EPub(filePath);

        epub.on('end', () => {
            const coverId = epub.metadata.cover;
            if (!coverId) {
                console.log(`⚠️ No cover found for book: ${bookId}`);
                return resolve(false);
            }

            epub.getImage(coverId, async (err, data) => {
                if (err || !data) {
                    console.error(` Failed to extract image for book: ${bookId}`);
                    return resolve(false);
                }

                try {
                    await sharp(data)
                        .resize({ height: 800, withoutEnlargement: true })
                        .avif({ quality: 45 })
                        .toFile(outputPath);

                    console.log(` Generated cover for EPUB book: ${bookId}`);
                    resolve(true);
                } catch (sharpErr) {
                    console.error(` Cover generation error for book ${bookId}:`, sharpErr.message);
                    resolve(false);
                }
            });
        });

        epub.on('error', (err) => {
            console.error(` Error parsing EPUB ${bookId}:`, err.message);
            resolve(false);
        });

        epub.parse();
    });
}

async function downloadBook(book) {
    const bookUrl = `${CLOUD_URL}/content/library/${book.id}.epub`;
    const localPath = path.join(LIBRARY_DIR, `${book.id}.epub`);

    const res = await fetch(bookUrl);
    if (!res.ok) throw new Error(`Failed to download book ${book.id}: ${res.statusText}`);

    const writeStream = fs.createWriteStream(localPath);
    for await (const chunk of res.body) {
        writeStream.write(chunk);
    }
    writeStream.end();

    await new Promise(resolve => writeStream.on('finish', resolve));

    // Generate cover
    await generateBookCover(localPath, book.id);

    // Update database
    const insertBook = serverDb.prepare(`
        INSERT OR REPLACE INTO books (id, name, category_ids)
        VALUES (?, ?, ?)
    `);
    insertBook.run(book.id, book.book_name, book.categories);

    return { id: book.id, status: 'downloaded' };
}

router.get('/available-books', async (req, res) => {
    try {
        console.log(`Fetching available books from ${CLOUD_URL}/library-metadata`);
        const cloudRes = await fetch(`${CLOUD_URL}/library-metadata`);
        console.log(`Cloud response status: ${cloudRes.status}`);
        if (!cloudRes.ok) return res.status(503).json({ error: 'Cloud server is not reachable' });
        const books = await cloudRes.json();
        console.log(`Fetched ${books.length} books`);
        res.json(books);
    } catch (err) {
        console.error('Error fetching available books:', err);
        res.status(500).json({ error: 'Failed to fetch available books' });
    }
});

router.post('/download', async (req, res) => {
    if (downloading) return res.status(400).json({ message: 'Another download is in progress' });

    const { books } = req.body;
    if (!Array.isArray(books) || !books.length) {
        return res.status(400).json({ error: 'No books specified' });
    }

    downloading = true;
    downloadStatus = "downloading";

    // Start background download
    (async () => {
        try {
            for (const book of books) {
                await downloadBook(book);
            }
            downloadStatus = "finished";
        } catch (err) {
            console.error('Download failed:', err);
            downloadStatus = "failed";
        } finally {
            downloading = false;
        }
    })();

    res.status(202).json({ message: 'Download started' });
});

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { name, categories } = req.body;
        const bookId = req.generatedId;
        const localPath = req.file.path;

        // Generate cover
        await generateBookCover(localPath, bookId);

        // Update database
        const insertBook = serverDb.prepare(`
            INSERT INTO books (id, name, category_ids)
            VALUES (?, ?, ?)
        `);
        insertBook.run(bookId, name || req.file.originalname, categories || "");

        res.json({
            message: 'Book uploaded and processed successfully',
            book: { id: bookId, name, categories }
        });
    } catch (err) {
        console.error('Upload failed:', err);
        // Clean up uploaded file if DB insert fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to process uploaded book' });
    }
});

router.get('/download-status', (req, res) => {
    res.json({ status: downloadStatus });
});

router.get('/books', (req, res) => {
    try {
        const books = serverDb.prepare('SELECT * FROM books').all();
        // Check for extension on disk
        const booksWithExt = books.map(book => {
            const hasEpub = fs.existsSync(path.join(LIBRARY_DIR, `${book.id}.epub`));
            const hasPdf = fs.existsSync(path.join(LIBRARY_DIR, `${book.id}.pdf`));
            return {
                ...book,
                type: hasPdf ? 'pdf' : 'epub'
            };
        });
        res.json(booksWithExt);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch local books' });
    }
});

router.get('/file/:id', (req, res) => {
    const epubPath = path.join(LIBRARY_DIR, `${req.params.id}.epub`);
    const pdfPath = path.join(LIBRARY_DIR, `${req.params.id}.pdf`);

    if (fs.existsSync(epubPath)) {
        res.sendFile(epubPath);
    } else if (fs.existsSync(pdfPath)) {
        res.contentType('application/pdf');
        res.sendFile(pdfPath);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

router.get('/categories', (req, res) => {
    try {
        const books = serverDb.prepare('SELECT category_ids FROM books').all();
        const categories = new Set();
        books.forEach(book => {
            book.category_ids.split(',').forEach(cat => {
                const trimmed = cat.trim();
                if (trimmed) categories.add(trimmed.toLowerCase());
            });
        });
        res.json(Array.from(categories));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

router.delete('/book/:id', (req, res) => {
    const id = req.params.id;
    const epubPath = path.join(LIBRARY_DIR, `${id}.epub`);
    const pdfPath = path.join(LIBRARY_DIR, `${id}.pdf`);
    const coverPath = path.join(COVERS_DIR, `${id}.avif`);

    try {
        // Delete file if exists
        if (fs.existsSync(epubPath)) {
            fs.unlinkSync(epubPath);
        }
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }

        // Delete cover if exists
        if (fs.existsSync(coverPath)) {
            fs.unlinkSync(coverPath);
        }

        // Delete from database
        serverDb.prepare('DELETE FROM books WHERE id = ?').run(id);

        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

export default router;
