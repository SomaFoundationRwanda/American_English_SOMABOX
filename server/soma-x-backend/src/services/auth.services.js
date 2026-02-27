import express from 'express';
import Database from 'better-sqlite3';

import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from "./users.service.js"
import bcrypt from "bcrypt";



import { serverDb } from '../helpers/db-manager.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        // Emergency Fallback for Hardcoded Admin
        if (username === 'admin@sfr.org' && password === 'Admin123') {
            const adminRow = serverDb.prepare('SELECT * FROM users WHERE email = ?').get('admin@sfr.org');
            if (adminRow) {
                console.log("Fallback login successful for admin@sfr.org");
                return res.json({
                    message: 'Login successful',
                    user: {
                        id: adminRow.id,
                        username: 'admin@sfr.org',
                        role: 'admin',
                        created_at: adminRow.created_at
                    }
                });
            }
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
