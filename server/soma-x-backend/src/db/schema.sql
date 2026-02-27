-- Categories = folders
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    parent_id INTEGER,
    path_key TEXT NOT NULL UNIQUE,
    is_main INTEGER NOT NULL DEFAULT 0,
    is_disabled INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    tags TEXT, -- Comma-separated tags for filtering (e.g. Pedagogy, STEM)
    body TEXT, -- Rich text content for the category
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Content = actual files
CREATE TABLE content_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    type TEXT NOT NULL, -- video, document, etc.
    url TEXT NOT NULL,
    path_key TEXT NOT NULL UNIQUE, -- relative file path, ensures uniqueness
    size INTEGER,
    duration INTEGER,
    pages INTEGER,
    video_url TEXT, -- External YouTube/Video link (AE Resource Pair)
    pdf_url TEXT, -- External/Specific PDF link (AE Resource Pair)
    audio_url TEXT,
    thumbnail_url TEXT,
    tags TEXT, -- Category/Topic tags
    body TEXT, -- Rich text/Section content
    is_disabled INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);


-- User accounts: admins vs teachers
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('admin','teacher')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sync log: track manual sync attempts
CREATE TABLE sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME,
    status TEXT, -- e.g. 'success','failed','partial'
    details TEXT -- optional JSON for errors
);


-- End of schema

CREATE TABLE book_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE books (
    id INTEGER PRIMARY KEY UNIQUE,
    name TEXT NOT NULL,
    category_ids TEXT NOT NULL, -- Comma-separated list of category IDs
    coverUrl TEXT
);

-- System settings for setup and config
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);