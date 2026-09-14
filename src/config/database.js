const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const bcrypt = require('bcryptjs');

const isVercel = Boolean(process.env.VERCEL);
const dbPath = process.env.DATABASE_PATH || (isVercel ? '/tmp/portfolio.db' : 'data/portfolio.db');
const fullPath = isVercel ? '/tmp/portfolio.db' : path.resolve(process.cwd(), dbPath);
const dir = path.dirname(fullPath);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new DatabaseSync(fullPath);

// Enable WAL mode for high performance concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      index_label TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      meta_tags TEXT NOT NULL,
      live_url TEXT NOT NULL,
      accent_color TEXT DEFAULT '#dfa874',
      order_index INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      idea TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      admin_note TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      target TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default Admin if no users exist
  const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const userCount = userCountStmt.get().count;

  if (userCount === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'vanshjain.dev@gmail.com';
    const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@12345';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPass, salt);

    const insertUser = db.prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
    );
    insertUser.run(adminEmail, hash, 'Vansh Jain', 'admin');
    console.log(`[DB] Initialized default admin account: ${adminEmail}`);
  }

  // Seed default portfolio projects if table is empty
  const projectCountStmt = db.prepare('SELECT COUNT(*) as count FROM projects');
  const projectCount = projectCountStmt.get().count;

  if (projectCount === 0) {
    const insertProject = db.prepare(`
      INSERT INTO projects (title, slug, index_label, description, category, meta_tags, live_url, accent_color, order_index, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProject.run(
      'RAKSHI\nCREATES',
      'rakshi-creates',
      '01 / 03',
      'A website for Rakshi’s resin art, collections, and custom work.',
      'RESIN ART / COLLECTIONS / CUSTOM',
      'LIVE EXPERIENCE | RESIN ART / COLLECTIONS / CUSTOM',
      'https://rakshi-creates.vercel.app/',
      '#dfa874',
      1,
      1
    );

    insertProject.run(
      'ISHIKA\nBAFNA',
      'ishika-bafna',
      '02 / 03',
      'A personal website for author and poet Ishika Bafna.',
      'AUTHOR / POET / WRITING',
      'LITERARY EXPERIENCE | AUTHOR / POET / WRITING',
      'https://ish-words.vercel.app/',
      '#d6cdb7',
      2,
      1
    );

    insertProject.run(
      'THE\nUNJUDGED',
      'the-unjudged',
      '03 / 03',
      'A focused digital space built around writing and thought.',
      'EDITORIAL DIGITAL SPACE',
      'THOUGHT / WRITING | EDITORIAL DIGITAL SPACE',
      'https://the-unjudged.ai.studio/',
      '#f4f3ef',
      3,
      1
    );

    console.log('[DB] Seeded initial portfolio projects.');
  }

  // Seed default site settings
  const settingsCountStmt = db.prepare('SELECT COUNT(*) as count FROM settings');
  const settingsCount = settingsCountStmt.get().count;

  if (settingsCount === 0) {
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('site_title', 'Vansh Jain — Creative Developer & UI/UX Designer');
    insertSetting.run('hero_role', 'CREATIVE DEVELOPER / UI/UX DESIGNER');
    insertSetting.run('hero_about', 'I design and build memorable digital experiences where deliberate design craft meets expressive frontend engineering.');
    insertSetting.run('contact_email', 'vanshjain.dev@gmail.com');
    insertSetting.run('social_github', 'https://github.com/vanshjain');
    insertSetting.run('social_linkedin', 'https://linkedin.com/in/vanshjain');
    insertSetting.run('social_instagram', 'https://instagram.com/vanshjain');
    insertSetting.run('social_whatsapp', "https://wa.me/?text=Hi%20Vansh,%20I'd%20like%20to%20discuss%20a%20project");
    console.log('[DB] Seeded default site settings.');
  }
}

initSchema();

module.exports = {
  db,
  queryAll(sql, ...params) {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },
  queryOne(sql, ...params) {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  },
  run(sql, ...params) {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  }
};
