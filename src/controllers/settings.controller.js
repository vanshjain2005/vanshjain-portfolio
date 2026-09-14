const { queryAll, queryOne, run } = require('../config/database');

exports.getSettings = (req, res) => {
  const rows = queryAll('SELECT key, value FROM settings');
  const settings = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
  return res.json({ success: true, data: settings });
};

exports.updateSettings = (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid settings payload' });
  }

  const upsert = (key, val) => {
    const existing = queryOne('SELECT key FROM settings WHERE key = ?', key);
    if (existing) {
      run('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?', String(val), key);
    } else {
      run('INSERT INTO settings (key, value) VALUES (?, ?)', key, String(val));
    }
  };

  for (const [k, v] of Object.entries(updates)) {
    if (v !== undefined && v !== null) {
      upsert(k, v);
    }
  }

  const rows = queryAll('SELECT key, value FROM settings');
  const settings = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
  return res.json({ success: true, message: 'Settings updated successfully', data: settings });
};
