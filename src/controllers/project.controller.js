const { queryAll, queryOne, run } = require('../config/database');

exports.getAll = (req, res) => {
  const isAuth = !!req.user;
  // If public, only return published projects sorted by order_index
  const sql = isAuth
    ? 'SELECT * FROM projects ORDER BY order_index ASC, id ASC'
    : 'SELECT * FROM projects WHERE is_published = 1 ORDER BY order_index ASC, id ASC';

  const projects = queryAll(sql);
  return res.json({ success: true, count: projects.length, data: projects });
};

exports.getOne = (req, res) => {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(id);
  const sql = isNumeric
    ? 'SELECT * FROM projects WHERE id = ?'
    : 'SELECT * FROM projects WHERE slug = ?';

  const project = queryOne(sql, isNumeric ? Number(id) : id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  return res.json({ success: true, data: project });
};

exports.create = (req, res) => {
  const {
    title,
    slug,
    index_label,
    description,
    category,
    meta_tags,
    live_url,
    accent_color = '#dfa874',
    order_index = 0,
    is_published = 1
  } = req.body;

  if (!title || !description || !live_url) {
    return res.status(400).json({ success: false, error: 'Title, description, and live URL are required' });
  }

  const generatedSlug = slug
    ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const existing = queryOne('SELECT id FROM projects WHERE slug = ?', generatedSlug);
  if (existing) {
    return res.status(409).json({ success: false, error: 'A project with this slug already exists' });
  }

  const label = index_label || '00 / 00';
  const cat = category || 'DIGITAL EXPERIENCE';
  const meta = meta_tags || `${cat} | LIVE EXPERIENCE`;

  const result = run(`
    INSERT INTO projects (title, slug, index_label, description, category, meta_tags, live_url, accent_color, order_index, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, title, generatedSlug, label, description, cat, meta, live_url, accent_color, Number(order_index), Number(is_published));

  const newProject = queryOne('SELECT * FROM projects WHERE id = ?', result.lastInsertRowid);
  return res.status(201).json({ success: true, message: 'Project created successfully', data: newProject });
};

exports.update = (req, res) => {
  const { id } = req.params;
  const project = queryOne('SELECT * FROM projects WHERE id = ?', Number(id));
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const {
    title = project.title,
    slug = project.slug,
    index_label = project.index_label,
    description = project.description,
    category = project.category,
    meta_tags = project.meta_tags,
    live_url = project.live_url,
    accent_color = project.accent_color,
    order_index = project.order_index,
    is_published = project.is_published
  } = req.body;

  run(`
    UPDATE projects
    SET title = ?, slug = ?, index_label = ?, description = ?, category = ?, meta_tags = ?,
        live_url = ?, accent_color = ?, order_index = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, title, slug, index_label, description, category, meta_tags, live_url, accent_color, Number(order_index), Number(is_published), Number(id));

  const updated = queryOne('SELECT * FROM projects WHERE id = ?', Number(id));
  return res.json({ success: true, message: 'Project updated successfully', data: updated });
};

exports.delete = (req, res) => {
  const { id } = req.params;
  const project = queryOne('SELECT * FROM projects WHERE id = ?', Number(id));
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  run('DELETE FROM projects WHERE id = ?', Number(id));
  return res.json({ success: true, message: 'Project deleted successfully' });
};
