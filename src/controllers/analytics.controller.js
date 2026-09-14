const Analytics = require('../models/Analytics');

exports.track = async (req, res, next) => {
  try {
    const { event_type, target } = req.body;

    if (!event_type) {
      return res.status(400).json({ success: false, error: 'event_type is required' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const record = await Analytics.create({
      event_type: String(event_type).trim(),
      target: target ? String(target).trim() : '',
      ip_address: String(ip),
      user_agent: userAgent.slice(0, 255)
    });

    return res.status(201).json({ success: true, id: record._id });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const totalEvents = await Analytics.countDocuments();
    const pageviews = await Analytics.countDocuments({ event_type: 'pageview' });
    const previewOpens = await Analytics.countDocuments({ event_type: 'preview_open' });
    const contactSubmits = await Analytics.countDocuments({ event_type: 'contact_submit' });

    const recent = await Analytics.find().sort({ created_at: -1 }).limit(10).lean();

    return res.json({
      success: true,
      data: {
        total_events: totalEvents,
        pageviews,
        preview_opens: previewOpens,
        contact_submits: contactSubmits,
        recent_activity: recent
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getSummary = exports.getStats;
