const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { db, initDatabase } = require('./database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sanitizeHtml = require('sanitize-html');
require('dotenv').config();

const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: "Too many requests, please try again later." }
});

// Middlewares
app.use(limiter);
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Multer Config (Filter for images)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Initialize DB tables
initDatabase();

// --- Middleware ---
const authenticateToken = (req, res, next) => {
    // Try to get token from header or cookie
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token && req.cookies) {
        token = req.cookies.authToken;
    }

    if (!token) return res.status(401).json({ error: "Authentication required" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid or expired token" });
        req.user = user;
        next();
    });
};

// --- API ROUTES ---

// Auth
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM authors WHERE username = ?", [username], async (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) return res.status(401).json({ error: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, row.password);
        if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

        const author = {
            id: row.id.toString(),
            name: row.name,
            username: row.username,
            avatarUrl: row.avatar_url,
            bio: row.bio
        };

        const token = jwt.sign({ id: author.id, username: author.username }, JWT_SECRET, { expiresIn: '24h' });

        // Set secure cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({ ...author, token }); // Still return token for mobile or other clients if needed
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: "Logged out successfully" });
});

// Authors (Public Read)
app.get('/api/authors', (req, res) => {
    db.all("SELECT id, name, username, bio, avatar_url FROM authors", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(r => ({
            id: r.id.toString(),
            name: r.name,
            username: r.username,
            bio: r.bio,
            avatarUrl: r.avatar_url
        })));
    });
});

// Create Author (Protected)
app.post('/api/authors', authenticateToken, async (req, res) => {
    const { name, username, password, bio, avatarUrl } = req.body;
    // Basic validation
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO authors (name, username, password, bio, avatar_url) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [name, username, hashedPassword, bio, avatarUrl], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "Author created" });
        });
    } catch (e) {
        res.status(500).json({ error: "Error creating author" });
    }
});

// Update Author (Protected)
app.put('/api/authors/:id', authenticateToken, async (req, res) => {
    const { name, username, password, bio, avatarUrl } = req.body;
    const authorId = req.params.id;

    // Optional: Check if req.user.id matches authorId or is admin
    // For now, allow any auth user to edit (simplified)

    let sql = `UPDATE authors SET name = ?, username = ?, bio = ?, avatar_url = ?`;
    let params = [name, username, bio, avatarUrl];

    if (password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql += `, password = ?`;
            params.push(hashedPassword);
        } catch (e) {
            return res.status(500).json({ error: "Error hashing password" });
        }
    }

    sql += ` WHERE id = ?`;
    params.push(authorId);

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Author not found" });
        res.json({ message: "Author updated successfully" });
    });
});

// Upload Image (Protected)
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// Get All Articles (Public) with pagination and filters
app.get('/api/articles', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const status = req.query.status || 'published';

    let whereClause = "WHERE articles.status = ?";
    let params = [status];

    if (category && category !== 'ALL') {
        whereClause += " AND categories.name = ?";
        params.push(category);
    }

    const sql = `
        SELECT 
            articles.*, 
            categories.name as category_name,
            categories.slug as category_slug,
            authors.name as author_name,
            authors.avatar_url as author_avatar,
            authors.bio as author_bio
        FROM articles
        LEFT JOIN categories ON articles.category_id = categories.id
        LEFT JOIN authors ON articles.author_id = authors.id
        ${whereClause}
        ORDER BY articles.created_at DESC
        LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: "Error fetching articles" });
            return;
        }
        const articles = rows.map(row => ({
            id: row.id.toString(),
            title: row.title,
            title_pt: row.title_pt,
            slug: row.slug,
            excerpt: row.excerpt,
            excerpt_pt: row.excerpt_pt,
            content: row.content,
            content_pt: row.content_pt,
            category: row.category_name,
            readTime: row.read_time,
            date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase(),
            updatedAt: row.updated_at ? new Date(row.updated_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase() : null,
            imageUrl: row.image_url,
            featured: !!row.featured,
            main: !!row.main,
            showThumbnail: !!row.show_thumbnail,
            status: row.status || 'draft',
            author: {
                id: row.author_id ? row.author_id.toString() : null,
                name: row.author_name,
                avatarUrl: row.author_avatar,
                bio: row.author_bio
            }
        }));
        res.json(articles);
    });
});

// Related Articles (Optimized)
app.get('/api/articles/related/:id', (req, res) => {
    const articleId = req.params.id;
    // Get category of current article first
    db.get("SELECT category_id FROM articles WHERE id = ?", [articleId], (err, row) => {
        if (err || !row) return res.json([]);

        const sql = `
            SELECT id, title, title_pt, category_id, 
            (SELECT name FROM categories WHERE id = articles.category_id) as category_name
            FROM articles 
            WHERE status = 'published' AND id != ? AND category_id = ?
            ORDER BY created_at DESC LIMIT 3
        `;
        db.all(sql, [articleId, row.category_id], (err, rows) => {
            if (err) return res.json([]);
            res.json(rows.map(r => ({
                id: r.id.toString(),
                title: r.title,
                title_pt: r.title_pt,
                category: r.category_name
            })));
        });
    });
});

// Get Single Article by ID (Public)
app.get('/api/articles/:id', (req, res) => {
    const sql = `
        SELECT 
            articles.*, 
            categories.name as category_name,
            categories.slug as category_slug,
            authors.name as author_name,
            authors.avatar_url as author_avatar,
            authors.bio as author_bio
        FROM articles
        LEFT JOIN categories ON articles.category_id = categories.id
        LEFT JOIN authors ON articles.author_id = authors.id
        WHERE articles.id = ?
    `;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Article not found" });
            return;
        }

        // Transform keys to match frontend expected types (camelCase)
        const article = {
            id: row.id.toString(),
            title: row.title,
            title_pt: row.title_pt,
            slug: row.slug,
            excerpt: row.excerpt,
            excerpt_pt: row.excerpt_pt,
            content: row.content,
            content_pt: row.content_pt,
            category: row.category_name,
            readTime: row.read_time,
            date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase(),
            updatedAt: row.updated_at ? new Date(row.updated_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase() : null,
            imageUrl: row.image_url,
            featured: !!row.featured,
            main: !!row.main,
            showThumbnail: !!row.show_thumbnail,
            status: row.status || 'draft',
            author: {
                id: row.author_id ? row.author_id.toString() : null,
                name: row.author_name,
                avatarUrl: row.author_avatar,
                bio: row.author_bio
            }
        };
        res.json(article);
    });
});

// Create New Article (Protected)
app.post('/api/articles', authenticateToken, (req, res) => {
    try {
        const { title, title_pt, excerpt, excerpt_pt, content, content_pt, category, readTime, imageUrl, featured, main, showThumbnail, authorId, status } = req.body;

        // SANITIZE
        const cleanContent = sanitizeHtml(content, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                'img': ['src', 'alt']
            }
        });
        const cleanContentPt = sanitizeHtml(content_pt || '', {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                'img': ['src', 'alt']
            }
        });
        const cleanExcerpt = sanitizeHtml(excerpt);
        const cleanExcerptPt = sanitizeHtml(excerpt_pt || '');

        // First find category ID
        db.get("SELECT id FROM categories WHERE name = ?", [category], (err, row) => {
            if (err) {
                console.error("error fetching category:", err);
                return res.status(500).json({ error: err.message });
            }

            let categoryId;
            if (!row) {
                console.error("Category not found:", category);
                return res.status(400).json({ error: "Invalid Category" });
            } else {
                categoryId = row.id;
                const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

                const sql = `INSERT INTO articles (title, title_pt, slug, excerpt, excerpt_pt, content, content_pt, category_id, read_time, image_url, featured, main, show_thumbnail, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const params = [title, title_pt, slug, cleanExcerpt, cleanExcerptPt, cleanContent, cleanContentPt, categoryId, readTime, imageUrl, featured ? 1 : 0, main ? 1 : 0, showThumbnail ? 1 : 0, authorId, status || 'draft'];

                db.run(sql, params, function (err) {
                    if (err) {
                        console.error("Database error creating article:", err.message);
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    res.json({
                        message: "Article created",
                        id: this.lastID
                    });
                });
            }
        });
    } catch (error) {
        console.error("Route error in /api/articles:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update Article (Protected)
app.put('/api/articles/:id', authenticateToken, (req, res) => {
    const { title, title_pt, excerpt, excerpt_pt, content, content_pt, category, readTime, imageUrl, featured, main, showThumbnail, authorId, status } = req.body;
    const articleId = req.params.id;

    // SANITIZE
    const cleanContent = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            'img': ['src', 'alt']
        }
    });
    const cleanContentPt = sanitizeHtml(content_pt || '', {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            'img': ['src', 'alt']
        }
    });
    const cleanExcerpt = sanitizeHtml(excerpt);
    const cleanExcerptPt = sanitizeHtml(excerpt_pt || '');

    // Find category ID first
    db.get("SELECT id FROM categories WHERE name = ?", [category], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!row) return res.status(400).json({ error: "Invalid Category" });

        const categoryId = row.id;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        const sql = `
            UPDATE articles 
            SET title = ?, title_pt = ?, slug = ?, excerpt = ?, excerpt_pt = ?, content = ?, content_pt = ?, category_id = ?, read_time = ?, image_url = ?, featured = ?, main = ?, show_thumbnail = ?, author_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const params = [title, title_pt, slug, cleanExcerpt, cleanExcerptPt, cleanContent, cleanContentPt, categoryId, readTime, imageUrl, featured ? 1 : 0, main ? 1 : 0, showThumbnail ? 1 : 0, authorId, status, articleId];

        db.run(sql, params, function (err) {
            if (err) {
                console.error("Database error updating article:", err.message);
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) return res.status(404).json({ error: "Article not found" });
            res.json({ message: "Article updated successfully" });
        });
    });
});

// Delete Article (Protected)
app.delete('/api/articles/:id', authenticateToken, (req, res) => {
    const sql = `DELETE FROM articles WHERE id = ?`;
    db.run(sql, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Article not found" });
        res.json({ message: "Article deleted successfully" });
    });
});

app.get('/api/categories', (req, res) => {
    db.all("SELECT * FROM categories", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
