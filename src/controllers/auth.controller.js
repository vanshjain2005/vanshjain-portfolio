const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryOne, run } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth.middleware');

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = queryOne('SELECT * FROM users WHERE email = ?', email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Authentication successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
};

exports.getMe = (req, res) => {
  const user = queryOne('SELECT id, email, name, role, created_at FROM users WHERE id = ?', req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  return res.json({ success: true, user });
};

exports.changePassword = (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
  }

  const user = queryOne('SELECT * FROM users WHERE id = ?', req.user.id);
  if (!user || !bcrypt.compareSync(oldPassword, user.password_hash)) {
    return res.status(401).json({ success: false, error: 'Incorrect current password' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  run('UPDATE users SET password_hash = ? WHERE id = ?', hash, req.user.id);

  return res.json({ success: true, message: 'Password updated successfully' });
};
