import express from 'express';
import Database from 'better-sqlite3';

import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from "bcrypt";



import { serverDb } from '../helpers/db-manager.js';

const router = express.Router();

export const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

router.get('', (req, res) => {
    const stmt = serverDb.prepare('SELECT * FROM users');
    const users = stmt.all();
    res.json(users);
});

router.get('/:id', (req, res) => {
    const stmt = serverDb.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(req.params.id);
    res.json(user);
});

router.post('/', async (req, res) => {
    try{
        const { email, role, password } = req.body;
        const password_hash = await hashPassword(password);
        if (!email || !role || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if user already exists
        const existingUser = serverDb.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }
        const stmt = serverDb.prepare('INSERT INTO users (email, role, password_hash) VALUES (?, ?, ?)');
        const info = stmt.run(email, role, password_hash);
        res.status(201).json({ id: info.lastInsertRowid, email, role });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', (req, res) => {
    const stmt = serverDb.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(req.params.id);
    res.status(204).end();
});

router.patch('/:id', async (req, res) => {
    try {
        const { email, role, password } = req.body;
        const userId = req.params.id;

        if (!email && !role && !password) {
            return res.status(400).json({ message: 'At least one field is required for update' });
        }

        let query = 'UPDATE users SET ';
        const params = [];
        const updates = [];

        if (email) {
            updates.push('email = ?');
            params.push(email);
        }
        if (role) {
            updates.push('role = ?');
            params.push(role);
        }
        if (password) {
            const password_hash = await hashPassword(password);
            updates.push('password_hash = ?');
            params.push(password_hash);
        }

        query += updates.join(', ') + ' WHERE id = ?';
        params.push(userId);
        
        const stmt = serverDb.prepare(query);
        const info = stmt.run(...params);

        if (info.changes === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;