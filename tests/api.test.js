const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/server');
const { connectDB, mongoose } = require('../src/config/database');

let server;
let baseUrl;

before(async () => {
  await connectDB();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
});

describe('Full-Stack Portfolio API Integration Tests', () => {
  test('GET /api/health should return 200 and healthy status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
  });

  test('GET /api/projects should return 200 and list of projects', async () => {
    const res = await fetch(`${baseUrl}/api/projects`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length >= 3);
  });

  test('POST /api/inquiries should validate input and store valid inquiry', async () => {
    // Missing fields
    const badRes = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' })
    });
    assert.strictEqual(badRes.status, 400);

    // Valid submission
    const goodRes = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Unit Test User',
        email: 'test@example.com',
        phone: '+1 555-0100',
        idea: 'Interested in a custom cinematic web application.'
      })
    });
    assert.strictEqual(goodRes.status, 201);
    const data = await goodRes.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.id);
  });

  test('Authentication flow: Admin login with valid credentials', async () => {
    // Invalid credentials
    const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jainvansh24712@gmail.com', password: 'WrongPassword' })
    });
    assert.strictEqual(badLogin.status, 401);

    // Valid credentials
    const goodLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jainvansh24712@gmail.com', password: 'Jainvansh24712@' })
    });
    assert.strictEqual(goodLogin.status, 200);
    const authData = await goodLogin.json();
    assert.strictEqual(authData.success, true);
    assert.ok(authData.token);

    // Protected endpoint with token
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${authData.token}` }
    });
    assert.strictEqual(meRes.status, 200);
    const meData = await meRes.json();
    assert.strictEqual(meData.user.email, 'jainvansh24712@gmail.com');
  });

  test('POST /api/projects requires authentication', async () => {
    const unauthRes = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Project',
        description: 'Test description',
        live_url: 'https://example.com'
      })
    });
    assert.strictEqual(unauthRes.status, 401);
  });

  test('GET /api/docs should serve Swagger documentation UI', async () => {
    const res = await fetch(`${baseUrl}/api/docs/`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('Swagger UI') || text.includes('swagger'));
  });
});
