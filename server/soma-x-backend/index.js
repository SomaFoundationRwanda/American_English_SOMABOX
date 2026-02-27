import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import { config } from './src/config/index.js';
import { serverDb, initSchemas } from './src/helpers/db-manager.js';

const app = express();
import cloudServices from './src/services/cloud.services.js';
import contentServices from './src/services/content.services.js';
import authServices from './src/services/auth.services.js';
import userServices from "./src/services/users.service.js";
import libraryServices from "./src/services/library.services.js";

// Initialize Database
console.log("Initializing system schemas...");
await initSchemas();

// Quick check for admin
const admin = serverDb.prepare('SELECT email FROM users WHERE email = ?').get('admin@sfr.org');
console.log(admin ? "System ready: Admin account exists." : "CRITICAL: Admin account missing!");

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://10.0.0.62:3001',
        'http://192.168.1.186:3001',
        'https://9c38c031342a.ngrok-free.app'
    ]
}));

const loggingMiddleware = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};
app.use(loggingMiddleware);

// API Routes
app.use("/cloud", cloudServices);
app.use("/content", contentServices);
app.use("/auth", authServices);
app.use("/users", userServices);
app.use("/library", libraryServices);

// Static Content Serving
app.use("/khan-academy", express.static(config.paths.static.khan));
app.use("/w3schools", express.static(config.paths.static.w3schools));
app.use("/wikipedia", express.static(config.paths.static.wikipedia));
app.use("/library-book-covers", express.static(config.paths.libraryCovers));
app.use("/pdf-book-covers", express.static(config.paths.pdfCovers));
app.use("/custom-content", express.static(config.paths.customContent));

// Server Start
app.listen(config.port)
    .on('listening', () => console.log(`Server running on port ${config.port}`))
    .on('error', err => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${config.port} is already in use`);
            process.exit(1);
        } else {
            throw err;
        }
    });
