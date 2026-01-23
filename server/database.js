const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

function initDatabase() {
    db.serialize(() => {
        // Categories Table
        db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        // Authors Table
        db.run(`CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      bio TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        // Articles Table - Added PT fields
        db.run(`CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_pt TEXT,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT,
      excerpt_pt TEXT,
      content TEXT,
      content_pt TEXT,
      category_id INTEGER,
      author_id INTEGER,
      read_time TEXT,
      image_url TEXT,
      featured BOOLEAN DEFAULT 0,
      main BOOLEAN DEFAULT 0,
      show_thumbnail BOOLEAN DEFAULT 1,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id),
      FOREIGN KEY (author_id) REFERENCES authors (id)
    )`);

        // Helper to insert initial data if empty
        db.get("SELECT count(*) as count FROM authors", (err, row) => {
            if (err) return console.error(err);
            if (row.count === 0) {
                console.log("Seeding initial author...");
                const hashedPassword = bcrypt.hashSync('admin123', 10);
                const sql = `INSERT INTO authors (name, username, password, bio, avatar_url) VALUES (?, ?, ?, ?, ?)`;
                db.run(sql, ['Admin User', 'admin@luxtech.io', hashedPassword, 'System Administrator', 'https://picsum.photos/seed/admin/200/200']);
            }
        });

        db.get("SELECT count(*) as count FROM categories", (err, row) => {
            if (err) return console.error(err);
            if (row.count === 0) {
                console.log("Seeding initial data...");
                const categories = ['ENGINEERING', 'DESIGN', 'BACKEND', 'REACT', 'UX'];
                categories.forEach(cat => {
                    db.run("INSERT INTO categories (name, slug) VALUES (?, ?)", [cat, cat.toLowerCase()]);
                });

                // Seed Articles (from mock data)
                const articles = [
                    {
                        title: 'The Future of AI Interfaces in Web Development',
                        title_pt: 'O Futuro das Interfaces de IA no Desenvolvimento Web',
                        excerpt: 'How Large Language Models are reshaping the way we construct user interfaces and the paradox of generated code.',
                        excerpt_pt: 'Como Grandes Modelos de Linguagem estão remodelando a maneira como construímos interfaces de usuário e o paradoxo do código gerado.',
                        category: 'ENGINEERING',
                        read_time: '5 min',
                        image_url: 'https://picsum.photos/seed/ai-tech/800/600',
                        featured: 1,
                        main: 1,
                        status: 'published',
                        content: `<p>In a world where digital interfaces are becoming increasingly complex, the need for <strong>simplification through intelligent design</strong> has never been more critical.</p><h2>The Paradox of Generated Interfaces</h2><p>As we integrate more Large Language Models into our development workflows, the code we ship is becoming less human-readable but more machine-optimized.</p><blockquote>"The interface is no longer a static canvas. It is a living, breathing entity that reacts to observation."</blockquote>`,
                        content_pt: `<p>Em um mundo onde interfaces digitais estão se tornando cada vez mais complexas, a necessidade de <strong>simplificação através do design inteligente</strong> nunca foi tão crítica.</p><h2>O Paradoxo das Interfaces Geradas</h2><p>À medida que integramos mais Grandes Modelos de Linguagem em nossos fluxos de trabalho de desenvolvimento, o código que enviamos está se tornando menos legível por humanos, mas mais otimizado para máquinas.</p><blockquote>"A interface não é mais uma tela estática. É uma entidade viva e que respira, que reage à observação."</blockquote>`
                    },
                    {
                        title: 'Glassmorphism: A Deep Dive into CSS Backdrop Filters',
                        title_pt: 'Glassmorphism: Um Mergulho Profundo em Filtros de Backdrop CSS',
                        excerpt: 'Technical breakdown of performance implications when using heavy blur effects in React applications.',
                        excerpt_pt: 'Análise técnica das implicações de desempenho ao usar efeitos de desfoque pesados em aplicações React.',
                        category: 'DESIGN',
                        read_time: '8 min',
                        image_url: 'https://picsum.photos/seed/glass/800/600',
                        featured: 0,
                        main: 0,
                        status: 'published',
                        content: '<p>Glassmorphism has taken the UI design world by storm...</p>',
                        content_pt: '<p>O Glassmorphism tomou o mundo do design de UI de assalto...</p>'
                    },
                    {
                        title: 'Rust for JavaScript Developers',
                        title_pt: 'Rust para Desenvolvedores JavaScript',
                        excerpt: 'Why the memory safety and concurrency model of Rust makes it the perfect companion for modern frontend tooling.',
                        excerpt_pt: 'Por que a segurança de memória e o modelo de concorrência do Rust o tornam o companheiro perfeito para ferramentas frontend modernas.',
                        category: 'BACKEND',
                        read_time: '12 min',
                        image_url: 'https://picsum.photos/seed/rust/800/600',
                        featured: 0,
                        main: 1,
                        status: 'published',
                        content: '<p>Rust is becoming the language of choice for tooling...</p>',
                        content_pt: '<p>Rust está se tornando a linguagem de escolha para ferramentas...</p>'
                    },
                    {
                        title: 'Understanding React Server Components',
                        title_pt: 'Entendendo React Server Components',
                        excerpt: 'Moving beyond the client-side waterfall. A practical guide to Next.js 14 architecture.',
                        excerpt_pt: 'Indo além da cachoeira do lado do cliente. Um guia prático para a arquitetura do Next.js 14.',
                        category: 'REACT',
                        read_time: '6 min',
                        image_url: 'https://picsum.photos/seed/react/800/600',
                        featured: 0,
                        main: 1,
                        status: 'published',
                        content: '<p>Server Components represent a shift in how we think about rendering...</p>',
                        content_pt: '<p>Server Components representam uma mudança na forma como pensamos sobre renderização...</p>'
                    },
                    {
                        title: 'Designing for Dark Mode First',
                        title_pt: 'Projetando para o Modo Escuro Primeiro',
                        excerpt: 'Color theory adjustments and accessibility concerns when your primary canvas is #050505.',
                        excerpt_pt: 'Ajustes na teoria das cores e preocupações de acessibilidade quando sua tela principal é #050505.',
                        category: 'UX',
                        read_time: '4 min',
                        image_url: 'https://picsum.photos/seed/darkmode/800/600',
                        featured: 0,
                        main: 0,
                        status: 'published',
                        content: '<p>Dark mode is more than just inverting colors...</p>',
                        content_pt: '<p>O modo escuro é mais do que apenas inverter cores...</p>'
                    }
                ];

                // Wait a bit for categories to exist, or just insert. Since sqlite is serial, it should be fine if we query inside.
                // But better to just blindly insert if we know the IDs, but we don't.
                // Let's just fetch default author if exists or 1.

                db.all("SELECT id, name FROM categories", (err, catRows) => {
                    const catMap = {};
                    catRows.forEach(c => catMap[c.name] = c.id);

                    db.get("SELECT id FROM authors LIMIT 1", (err, authorRow) => {
                        const authorId = authorRow ? authorRow.id : 1;
                        articles.forEach(article => {
                            if (catMap[article.category]) {
                                const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                                db.run(`INSERT INTO articles (title, title_pt, slug, excerpt, excerpt_pt, content, content_pt, category_id, read_time, image_url, featured, main, author_id, status) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                    [article.title, article.title_pt, slug, article.excerpt, article.excerpt_pt, article.content, article.content_pt, catMap[article.category], article.read_time, article.image_url, article.featured, article.main, authorId, article.status || 'draft'], (err) => {
                                        if (err) console.error("Failed to insert article: " + article.title, err.message);
                                        else console.log("Successfully seeded article: " + article.title);
                                    });
                            }
                        });
                    });
                });
            }
        });

    });
}

module.exports = { db, initDatabase };
