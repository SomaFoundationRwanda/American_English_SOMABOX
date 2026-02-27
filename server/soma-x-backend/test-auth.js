import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';

const dbPath = './src/db/db.sqlite3';
const db = new Database(dbPath);

async function test() {
    const username = 'admin@sfr.org';
    const password = 'Admin123';

    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(username);
    console.log("Row found:", row);

    if (row) {
        const match = await bcrypt.compare(password, row.password_hash);
        console.log("Bcrypt comparison match:", match);

        console.log("Role match (admin):", row.role === 'admin');
    } else {
        console.log("User not found!");
    }
}

test();
