const Setting = require('../models/Setting');

exports.getAll = async (req, res, next) => {
  try {
    const settings = await Setting.find().lean();
    const map = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

    return res.json({
      success: true,
      data: map
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updates = req.body;

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid settings payload' });
    }

    const ops = Object.entries(updates).map(([key, value]) => {
      return Setting.findOneAndUpdate(
        { key: String(key) },
        { value: String(value) },
        { upsert: true, new: true }
      );
    });

    await Promise.all(ops);

    return res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.getSettings = exports.getAll;
exports.updateSettings = exports.update;
