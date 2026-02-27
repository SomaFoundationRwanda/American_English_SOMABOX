import Database from 'better-sqlite3';
import { config } from '../config/index.js';
import fs from 'fs';
import path from 'path';

// Ensure DB directories exist
const serverDbDir = path.dirname(config.db.serverPath);
const localDbDir = path.dirname(config.db.localPath);

if (!fs.existsSync(serverDbDir)) fs.mkdirSync(serverDbDir, { recursive: true });
if (!fs.existsSync(localDbDir)) fs.mkdirSync(localDbDir, { recursive: true });

// Initialize connections
export const serverDb = new Database(config.db.serverPath);
export const localDb = new Database(config.db.localPath);

// Configuration for better performance
serverDb.pragma('journal_mode = WAL');
localDb.pragma('journal_mode = WAL');

console.log(`Connected to Server DB: ${config.db.serverPath}`);
console.log(`Connected to Local DB: ${config.db.localPath}`);

import bcrypt from 'bcrypt';

/**
 * Initialize schemas if they don't exist
 * Note: serverDb needs schema.sql for users, categories, etc.
 * localDb needs core tables for custom content.
 */
export async function initSchemas() {
    const schemaPath = path.join(config.paths.root, 'src/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // 1. Initialize Server DB (if users table missing)
    const serverTables = serverDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (!serverTables) {
        console.log("Initializing Server DB with master schema...");
        serverDb.exec(schema);

        // Initialize setup status - bypass by default
        serverDb.prepare('INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?)').run('setup_done', '1');

        console.log(`System initialized.`);
    }

    // Ensure Hardcoded admin account exists
    const adminExists = serverDb.prepare('SELECT 1 FROM users WHERE email = ?').get('admin@sfr.org');
    if (!adminExists) {
        console.log("Creating hardcoded admin account...");
        const hashedPassword = await bcrypt.hash('Admin123', 10);
        serverDb.prepare(`
            INSERT INTO users (email, password_hash, role) 
            VALUES (?, ?, ?)
        `).run('admin@sfr.org', hashedPassword, 'admin');
        console.log("Admin account admin@sfr.org created.");
    } else {
        console.log("Admin account admin@sfr.org already exists.");
    }

    // Migration logic for AE fields (Resource Pair)
    const addMissingColumns = (db, table, columns) => {
        const info = db.prepare(`PRAGMA table_info(${table})`).all();
        const existing = info.map(c => c.name);
        for (const col of columns) {
            if (!existing.includes(col)) {
                console.log(`Migrating: Adding ${col} to ${table}...`);
                db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} TEXT`);
            }
        }
    };

    addMissingColumns(serverDb, 'categories', ['tags', 'body']);
    addMissingColumns(serverDb, 'content_items', ['video_url', 'pdf_url', 'tags', 'body', 'audio_url', 'thumbnail_url']);
    addMissingColumns(localDb, 'categories', ['tags', 'body']);
    addMissingColumns(localDb, 'content_items', ['video_url', 'pdf_url', 'tags', 'body', 'audio_url', 'thumbnail_url']);

    // 2. Initialize Local DB (Custom Content)
    localDb.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subtitle TEXT,
            body TEXT,
            parent_id INTEGER,
            path_key TEXT NOT NULL UNIQUE,
            is_main INTEGER NOT NULL DEFAULT 0,
            is_disabled INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            tags TEXT,
            FOREIGN KEY (parent_id) REFERENCES categories(id)
        );
        CREATE TABLE IF NOT EXISTS content_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            body TEXT,
            type TEXT NOT NULL,
            url TEXT NOT NULL,
            path_key TEXT NOT NULL UNIQUE,
            size INTEGER,
            duration INTEGER,
            pages INTEGER,
            video_url TEXT,
            pdf_url TEXT,
            audio_url TEXT,
            thumbnail_url TEXT,
            tags TEXT,
            is_disabled INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
    `);

    // Ensure root category in local DB
    const rootPath = config.defaults.customContentRoot;
    const rootExists = localDb.prepare(`SELECT 1 FROM categories WHERE path_key = ?`).get(rootPath);

    if (!rootExists) {
        localDb.prepare(`
            INSERT INTO categories (title, subtitle, parent_id, path_key, is_main, is_disabled)
            VALUES (?, ?, ?, ?, 1, 0)
        `).run("Custom Content", "User-managed content", null, rootPath);

        if (!fs.existsSync(config.paths.customContent)) {
            fs.mkdirSync(config.paths.customContent, { recursive: true });
        }
    }
}
