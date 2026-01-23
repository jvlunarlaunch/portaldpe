const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/database.sqlite');

db.run(`ALTER TABLE articles ADD COLUMN status TEXT DEFAULT 'published'`, (err) => {
    if (err) {
        console.log('Column might already exist or error:', err.message);
    } else {
        console.log('Successfully added status column.');
    }
    db.close();
});
