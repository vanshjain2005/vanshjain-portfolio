const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Setting = require('../models/Setting');

async function seedInitialData() {
  try {
    // 1. Seed Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'vanshjain.dev@gmail.com').toLowerCase().trim();
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@12345';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      await User.create({
        email: adminEmail,
        password_hash: passwordHash,
        name: 'Vansh Jain',
        role: 'admin'
      });
      console.log(`[SEED] Created default admin user: ${adminEmail}`);
    }

    // 2. Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const defaultProjects = [
        {
          title: 'RAKSHI CREATES',
          slug: 'rakshi-creates',
          index_label: '01 / 03',
          description: "A website for Rakshi's resin art, collections, and custom work.",
          category: 'RESIN ART / COLLECTIONS / CUSTOM',
          meta_tags: 'RESIN ART, E-COMMERCE, CUSTOM WORK',
          live_url: 'https://rakshi-creates.vercel.app/',
          accent_color: '#dfa874',
          order_index: 0,
          is_published: true
        },
        {
          title: 'ISH-WORDS',
          slug: 'ish-words',
          index_label: '02 / 03',
          description: 'A personal website for author and poet Ishika Bafna.',
          category: 'AUTHOR / POET / WRITING',
          meta_tags: 'LITERARY, PORTFOLIO, POETRY',
          live_url: 'https://ish-words.vercel.app/',
          accent_color: '#dfa874',
          order_index: 1,
          is_published: true
        },
        {
          title: 'THE UNJUDGED',
          slug: 'the-unjudged',
          index_label: '03 / 03',
          description: 'A focused digital space built around writing and thought.',
          category: 'THOUGHT / WRITING / EDITORIAL',
          meta_tags: 'EDITORIAL, SPA, WRITING',
          live_url: 'https://the-unjudged.ai.studio/',
          accent_color: '#f4f3ef',
          order_index: 2,
          is_published: true
        }
      ];
      await Project.insertMany(defaultProjects);
      console.log(`[SEED] Seeded ${defaultProjects.length} initial projects.`);
    }

    // 3. Seed Settings
    const defaultSettings = [
      { key: 'hero_role', value: 'CREATIVE DEVELOPER / UI/UX DESIGNER' },
      { key: 'hero_kicker', value: 'ABOUT' },
      { key: 'hero_copy', value: 'I design and build memorable digital experiences where deliberate design craft meets expressive frontend engineering.' },
      { key: 'contact_email', value: 'vanshjain.dev@gmail.com' },
      { key: 'site_title', value: 'Vansh Jain — Creative Developer & UI/UX Designer' }
    ];

    for (const setting of defaultSettings) {
      const exists = await Setting.findOne({ key: setting.key });
      if (!exists) {
        await Setting.create(setting);
      }
    }
  } catch (err) {
    console.error('[SEED ERROR]', err.message);
  }
}

module.exports = seedInitialData;
