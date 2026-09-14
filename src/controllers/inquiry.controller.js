const Inquiry = require('../models/Inquiry');
const Analytics = require('../models/Analytics');

exports.submit = async (req, res, next) => {
  try {
    const { name, email, phone, idea } = req.body;

    if (!name || !email || !idea) {
      return res.status(400).json({ success: false, error: 'Name, email, and project idea are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    const newInquiry = await Inquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      idea: idea.trim(),
      ip_address: String(ip)
    });

    // Also record an analytics event in Compass
    try {
      await Analytics.create({
        event_type: 'contact_submit',
        target: name.trim(),
        ip_address: String(ip),
        user_agent: req.headers['user-agent'] || ''
      });
    } catch(e){}

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been received. Vansh will get back to you shortly!',
      id: newInquiry._id
    });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['new', 'read', 'replied', 'archived'].includes(status)) {
      filter.status = status;
    }

    const inquiries = await Inquiry.find(filter).sort({ created_at: -1 }).lean();

    // Aggregated status counts for dashboard stats
    const statsArray = await Inquiry.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const stats = statsArray.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});

    return res.json({
      success: true,
      count: inquiries.length,
      stats,
      data: inquiries
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    if (!status || !['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const updateFields = { status };
    if (admin_note !== undefined) updateFields.admin_note = admin_note;

    const updated = await Inquiry.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    return res.json({ success: true, message: 'Inquiry updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Inquiry.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    return res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.delete = exports.deleteInquiry;
