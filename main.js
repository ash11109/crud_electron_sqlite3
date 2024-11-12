const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbFilePath = './database.db';

// Function to initialize the database and create table only if it doesn't exist
function initializeDatabase() {
    const dbExists = fs.existsSync(dbFilePath);

    const db = new sqlite3.Database(dbFilePath, (err) => {
        if (err) {
            console.error("Error opening database", err);
        } else if (!dbExists) {
            // If database does not exist, create the users table
            db.run(
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT
                )`,
                (err) => {
                    if (err) {
                        console.error("Error creating table", err);
                    } else {
                        console.log("Users table created successfully.");
                    }
                }
            );
        } else {
            console.log("Database and users table already exist.");
        }
    });

    return db;
}

let db = initializeDatabase();

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false
        }
    });
    win.loadFile('index.html');
}

// IPC handlers for CRUD operations
ipcMain.handle('create-user', async (event, user) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO users (name, email) VALUES (?, ?)`,
            [user.name, user.email],
            function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            }
        );
    });
});

ipcMain.handle('read-users', async () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users`, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});

ipcMain.handle('update-user', async (event, user) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE users SET name = ?, email = ? WHERE id = ?`,
            [user.name, user.email, user.id],
            function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            }
        );
    });
});

ipcMain.handle('delete-user', async (event, id) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
});

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
