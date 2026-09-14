const { queryAll, run } = require('../config/database');

exports.track = (req, res) => {
  const { event_type, target } = req.body;
  if (!event_type) {
    return res.status(400).json({ success: false, error: 'event_type is required' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';

  run(`
    INSERT INTO analytics (event_type, target, ip_address, user_agent)
    VALUES (?, ?, ?, ?)
  `, String(event_type), target ? String(target) : null, String(ip), String(ua));

  return res.json({ success: true, message: 'Event tracked' });
};

exports.getSummary = (req, res) => {
  const totalViews = queryAll("SELECT COUNT(*) as count FROM analytics WHERE event_type = 'pageview'")[0]?.count || 0;
  const totalClicks = queryAll("SELECT COUNT(*) as count FROM analytics WHERE event_type = 'project_click'")[0]?.count || 0;
  const totalInquiries = queryAll("SELECT COUNT(*) as count FROM inquiries")[0]?.count || 0;
  const recentEvents = queryAll("SELECT * FROM analytics ORDER BY created_at DESC LIMIT 20");

  return res.json({
    success: true,
    data: {
      totalViews,
      totalClicks,
      totalInquiries,
      conversionRate: totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) + '%' : '0%',
      recentEvents
    }
  });
};
