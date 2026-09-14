require('dotenv').config();
const express = require('express');
const path = require('node:path');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();
const PORT = process.env.PORT || 8080;

// Security & Parsing Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow iframes for external preview showcase
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(process.cwd(), 'public')));

// API Documentation (Swagger UI)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Vansh Jain Portfolio API Docs',
  customCss: '.swagger-ui .topbar { background-color: #08090b; }'
}));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// Reverse Proxy for preview showcase (bypasses SAMEORIGIN frame restrictions and CORS)
app.get('/api/proxy/unjudged', async (req, res) => {
  try {
    const upstream = await fetch('https://the-unjudged.ai.studio/', {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    let html = await upstream.text();
    // Route assets through our local proxy to avoid cross-origin module blocking
    html = html.replaceAll('src="/assets/', 'src="/api/proxy/unjudged/assets/');
    html = html.replaceAll('href="/assets/', 'href="/api/proxy/unjudged/assets/');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.send(html);
  } catch (err) {
    console.error('[PROXY ERROR]', err);
    res.status(502).send('Error loading preview');
  }
});

app.get('/api/proxy/unjudged/assets/:file(*)', async (req, res) => {
  try {
    const file = req.params.file;
    const upstream = await fetch(`https://the-unjudged.ai.studio/assets/${file}`);
    const buffer = await upstream.arrayBuffer();
    const contentType = upstream.headers.get('content-type') || (file.endsWith('.js') ? 'application/javascript; charset=utf-8' : file.endsWith('.css') ? 'text/css; charset=utf-8' : 'application/octet-stream');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('[PROXY ASSET ERROR]', err);
    res.status(404).send('Asset not found');
  }
});

// Admin Dashboard Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'admin.html'));
});

// Fallback to Main Portfolio for SPA routing if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Vansh Jain Portfolio Server Running on Port ${PORT}`);
    console.log(`🌐 Public Website:     http://localhost:${PORT}/`);
    console.log(`⚡ Admin Dashboard:    http://localhost:${PORT}/admin`);
    console.log(`📖 API Documentation:  http://localhost:${PORT}/api/docs`);
    console.log(`====================================================`);
  });
}

module.exports = app;
