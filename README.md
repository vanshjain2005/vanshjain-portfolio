# Vansh Jain — Full-Stack Cinematic Portfolio & Studio CMS

A production-ready full-stack portfolio web application crafted with an editorial dark aesthetic, GSAP cinematic scroll storytelling, an Express REST API backend, SQLite persistence, OpenAPI/Swagger documentation, and an integrated Admin CMS Dashboard.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
The project comes with default development settings pre-configured in `.env`:
```env
PORT=8080
NODE_ENV=development
JWT_SECRET=super-secret-vansh-portfolio-jwt-token-key-2026
ADMIN_EMAIL=vanshjain.dev@gmail.com
ADMIN_DEFAULT_PASSWORD=Admin@12345
DATABASE_PATH=data/portfolio.db
```

### 3. Run the Server
```bash
npm start
```
Or run with auto-reload in development:
```bash
npm run dev
```

The application will be accessible at:
- 🌐 **Public Website**: [http://localhost:8080/](http://localhost:8080/)
- ⚡ **Admin CMS Portal**: [http://localhost:8080/admin](http://localhost:8080/admin)
- 📖 **Swagger API Docs**: [http://localhost:8080/api/docs](http://localhost:8080/api/docs)
- 🩺 **Health Check**: [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

## 🔑 Default Admin Credentials

| Parameter | Value |
|---|---|
| **Email** | `vanshjain.dev@gmail.com` |
| **Password** | `Admin@12345` |

*(You can update this password at any time inside the Admin Dashboard under the **Settings** tab).*

---

## 🏗️ Architecture & Features

### Frontend
- **Cinematic Experience**: Ultra-smooth GSAP ScrollTrigger timeline choreography with typography in `Syne`, `Italiana`, `Space Mono`, and `Plus Jakarta Sans`.
- **Dynamic Projects**: Showcases live website embeds with isolated iframe pointer interaction, exit controls, and fallback external links.
- **Dynamic Contact Form**: Submits inquiries directly to the backend database with instant visual feedback and mail client fallback.
- **Visitor Telemetry**: Automatic pageview and project interaction tracking.

### Admin CMS Dashboard (`/admin`)
- **JWT Authentication**: Secure login with token expiration and password hashing using bcrypt.
- **Projects Manager**: Create, edit, toggle visibility, reorder, and delete portfolio showcase projects.
- **Inquiries Inbox**: Real-time list of client inquiries with status tracking (`new`, `read`, `replied`, `archived`) and direct email reply links.
- **Real-Time Analytics**: Summary metrics for pageviews, project preview clicks, inquiry conversion rate, and recent visitor logs.
- **Site Settings**: Manage hero role, about paragraph, social URLs, and admin credentials.

### Backend REST API
- **Framework**: Express.js with layered architecture (`controllers`, `routes`, `middleware`, `config`).
- **Database**: Node.js native `node:sqlite` (SQLite) with WAL mode for zero-setup, lightning-fast synchronous operations, auto-migrations, and seeds.
- **Security**: Rate limiting on sensitive endpoints (login, contact form submission), Helmet security headers, CORS, and centralized error handling.
- **API Documentation**: Interactive Swagger / OpenAPI 3.0 UI at `/api/docs`.

---

## 🧪 Running Automated Tests

Run the native integration test suite:
```bash
npm test
```

Verifies:
- `GET /api/health` status
- `GET /api/projects` list & schema
- `POST /api/inquiries` validation & storage
- `POST /api/auth/login` token generation & verification
- Protected endpoint authorization guards
- `GET /api/docs` Swagger UI availability

---

## 📂 Project Structure

```
├── data/
│   └── portfolio.db              # SQLite database (auto-created)
├── public/
│   ├── css/
│   │   └── admin.css             # Dark editorial Admin CMS styling
│   ├── js/
│   │   └── admin.js              # Admin Dashboard SPA controller
│   ├── index.html                # Main dynamic portfolio experience
│   └── admin.html                # Admin CMS login & management dashboard
├── src/
│   ├── config/
│   │   ├── database.js           # SQLite connection & schema migrations
│   │   └── swagger.js            # OpenAPI 3.0 specification
│   ├── controllers/
│   │   ├── auth.controller.js    # Admin login & profile
│   │   ├── project.controller.js # Projects CRUD
│   │   ├── inquiry.controller.js # Contact form submissions & inbox
│   │   ├── analytics.controller.js # Interaction telemetry
│   │   └── settings.controller.js  # Profile & metadata configuration
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification
│   │   ├── error.middleware.js   # Centralized error handler
│   │   └── security.js           # Helmet, CORS & Rate Limiters
│   ├── routes/                   # Express route definitions
│   └── server.js                 # App configuration & server bootstrap
├── tests/
│   └── api.test.js               # Integration test suite
├── .env                          # Local environment variables
└── package.json                  # Scripts & dependencies
```

---

## 🚀 Production Deployment

This application is self-contained and ready to deploy on any Node.js hosting platform:
- **Render / Railway / Fly.io / VPS**:
  - Run `npm install` and `npm start`.
  - Mount a persistent volume to `data/` to retain the SQLite database across restarts.
