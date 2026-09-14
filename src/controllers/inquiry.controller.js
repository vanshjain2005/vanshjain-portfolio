const { queryAll, queryOne, run } = require('../config/database');

exports.submit = (req, res) => {
  const { name, email, phone, idea } = req.body;

  if (!name || !email || !idea) {
    return res.status(400).json({ success: false, error: 'Name, email, and project idea are required' });
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  const result = run(`
    INSERT INTO inquiries (name, email, phone, idea, ip_address)
    VALUES (?, ?, ?, ?, ?)
  `, name.trim(), email.trim().toLowerCase(), (phone || '').trim(), idea.trim(), String(ip));

  // Also record analytics submission
  run('INSERT INTO analytics (event_type, target, ip_address) VALUES (?, ?, ?)', 'contact_submit', name.trim(), String(ip));

  return res.status(201).json({
    success: true,
    message: 'Your inquiry has been received. Vansh will get back to you shortly!',
    id: Number(result.lastInsertRowid)
  });
};

exports.list = (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM inquiries';
  const params = [];

  if (status && ['new', 'read', 'replied', 'archived'].includes(status)) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC';
  const inquiries = queryAll(sql, ...params);

  // Stats count
  const stats = queryAll(`
    SELECT status, COUNT(*) as count FROM inquiries GROUP BY status
  `);

  return res.json({
    success: true,
    count: inquiries.length,
    stats: stats.reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {}),
    data: inquiries
  });
};

exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status, admin_note } = req.body;

  const inquiry = queryOne('SELECT * FROM inquiries WHERE id = ?', Number(id));
  if (!inquiry) {
    return res.status(404).json({ success: false, error: 'Inquiry not found' });
  }

  const newStatus = status || inquiry.status;
  const newNote = admin_note !== undefined ? admin_note : inquiry.admin_note;

  run('UPDATE inquiries SET status = ?, admin_note = ? WHERE id = ?', newStatus, newNote, Number(id));
  const updated = queryOne('SELECT * FROM inquiries WHERE id = ?', Number(id));

  return res.json({ success: true, message: 'Inquiry status updated', data: updated });
};

exports.delete = (req, res) => {
  const { id } = req.params;
  const inquiry = queryOne('SELECT * FROM inquiries WHERE id = ?', Number(id));
  if (!inquiry) {
    return res.status(404).json({ success: false, error: 'Inquiry not found' });
  }

  run('DELETE FROM inquiries WHERE id = ?', Number(id));
  return res.json({ success: true, message: 'Inquiry deleted successfully' });
};
