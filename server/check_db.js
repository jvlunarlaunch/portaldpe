const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("--- Checking Database Status ---");

    // Check Categories
    db.all("SELECT * FROM categories", (err, rows) => {
        if (err) {
            console.error("Error reading categories:", err.message);
        } else {
            console.log(`\n[Categories] Count: ${rows.length}`);
            rows.forEach(r => console.log(` - ID: ${r.id}, Name: ${r.name}, Slug: ${r.slug}`));
        }
    });

    // Check Articles
    db.all("SELECT * FROM articles", (err, rows) => {
        if (err) {
            console.error("Error reading articles:", err.message);
        } else {
            console.log(`\n[Articles] Count: ${rows.length}`);
            rows.forEach(r => console.log(` - ID: ${r.id}, Title: ${r.title.substring(0, 30)}..., CategoryID: ${r.category_id}, Main: ${r.main}, Featured: ${r.featured}`));
        }
    });
});

db.close();
