const Project = require('../models/Project');

exports.list = async (req, res, next) => {
  try {
    const isPublic = req.query.all !== 'true';
    const filter = isPublic ? { is_published: true } : {};

    const projects = await Project.find(filter).sort({ order_index: 1, created_at: 1 }).lean();

    return res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    next(err);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await Project.findOne({ slug }).lean();

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    return res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, slug, index_label, description, category, meta_tags, live_url, accent_color, order_index, is_published } = req.body;

    if (!title || !slug || !live_url || !description) {
      return res.status(400).json({ success: false, error: 'Title, slug, live_url, and description are required' });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const existing = await Project.findOne({ slug: cleanSlug });
    if (existing) {
      return res.status(409).json({ success: false, error: 'A project with this slug already exists' });
    }

    const project = await Project.create({
      title: title.trim(),
      slug: cleanSlug,
      index_label: index_label || '01 / 03',
      description: description.trim(),
      category: category || 'CREATIVE DEVELOPMENT',
      meta_tags: meta_tags || '',
      live_url: live_url.trim(),
      accent_color: accent_color || '#dfa874',
      order_index: Number(order_index) || 0,
      is_published: is_published !== false
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.slug) {
      updates.slug = updates.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      const conflict = await Project.findOne({ slug: updates.slug, _id: { $ne: id } });
      if (conflict) {
        return res.status(409).json({ success: false, error: 'Another project already has this slug' });
      }
    }

    const project = await Project.findByIdAndUpdate(id, updates, { new: true });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    return res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getAll = exports.list;

exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    let project = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id).lean();
    }
    if (!project) {
      project = await Project.findOne({ slug: id }).lean();
    }
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    return res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

exports.delete = exports.remove;
