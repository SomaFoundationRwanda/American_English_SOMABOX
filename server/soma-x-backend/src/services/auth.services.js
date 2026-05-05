import express from 'express';
import Database from 'better-sqlite3';

import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from "./users.service.js"
import bcrypt from "bcrypt";



import { serverDb } from '../helpers/db-manager.js';

const router = express.Router();

router.get('/setup-status', (req, res) => {
    try {
        const setupDone = serverDb.prepare('SELECT value FROM system_settings WHERE key = ?').get('setup_done');
        return res.json({ setup_done: setupDone?.value === '1' });
    } catch (error) {
        console.error('Setup status check error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/setup', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        // Check if already setup
        const setupDone = serverDb.prepare('SELECT value FROM system_settings WHERE key = ?').get('setup_done');
        if (setupDone?.value === '1') {
            return res.status(400).json({ message: 'System already setup' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Use a transaction to ensure both user creation and setup status update succeed
        const transaction = serverDb.transaction(() => {
            serverDb.prepare(`
                INSERT INTO users (email, password_hash, role) 
                VALUES (?, ?, ?)
            `).run(email, hashedPassword, 'admin');

            serverDb.prepare('UPDATE system_settings SET value = ? WHERE key = ?').run('1', 'setup_done');
        });

        transaction();

        return res.json({ message: 'Setup successful' });
    } catch (error) {
        console.error('Setup error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        const row = serverDb.prepare('SELECT * FROM users WHERE email = ?').get(username);
        console.log("Auth attempt for:", username, "DB Row found:", !!row);

        if (!row) {
            console.log("No user found with email:", username);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const match = await bcrypt.compare(password, row.password_hash);
        console.log("Password match:", match, "Received role:", role, "DB role:", row.role);

        if (!match) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (row.role !== role) {
            console.log("Role mismatch. Expected:", row.role, "Got:", role);
            return res.status(401).json({ message: 'Invalid role' });
        }

        return res.json({
            message: 'Login successful',
            user: {
                id: row.id,
                username: row.username,
                role: row.role,
                created_at: row.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/verify-auth', (req, res) => {
    try {
        // This route was referencing `row` which doesn't exist here.
        // Keeping the route but returning a fixed structure.
        return res.status(400).json({ message: 'No session mechanism implemented yet' });
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
