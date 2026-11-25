# Project Atlas

An all-in-one workspace that brings a social feed, real-time chat, voice/video calls, notes, files, a calendar and an AI assistant together in a single installable web app.

**Live:** https://hellenicdev.eu/project-atlas/

## Features

- Social feed with posts, comments and profiles
- Real-time chat, presence and notifications over Socket.IO
- WebRTC voice and video calls
- Notes, folders and file uploads (Cloudinary)
- Calendar with events
- AI assistant (Groq, with Gemini as fallback)
- Search, command palette and keyboard shortcuts
- Admin dashboard
- JWT auth with refresh tokens, email verification and password reset (Resend), Cloudflare Turnstile
- Installable PWA with offline support
- Helmet, input sanitization, Mongo query sanitization and rate limiting

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | Vanilla JavaScript SPA (ES modules), CSS, service worker (GitHub Pages) |
| Backend | Node.js, Express, Socket.IO, express-validator, Helmet, winston |
| Database | MongoDB via Mongoose, optional Redis cache (ioredis) and BullMQ |
| Services | Cloudinary, Groq, Gemini, Resend, Cloudflare Turnstile |
| Hosting | GitHub Pages (frontend), Render (API) |

## Getting started

Requirements: Node.js 20+ and a MongoDB connection string.

```bash
git clone https://github.com/hellenicdev/project-atlas.git
cd project-atlas/backend
cp .env.example .env   # fill in the values
npm install
npm run dev            # API on http://localhost:3050
npm test               # Jest tests
```

Serve the repo root with any static server (for example `npx serve .`) and point `js/config/runtime.js` at your local API.

### Environment variables (`backend/.env`)

| Name | Purpose |
| --- | --- |
| `PORT`, `NODE_ENV` | Server port (default `3050`) and environment |
| `MONGO_URI` | MongoDB connection string (required) |
| `JWT_SECRET` | Signs access tokens (required) |
| `JWT_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN` | Token lifetimes |
| `REDIS_URL` | Optional Redis for caching and queues |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | File uploads |
| `GROQ_API_KEY`, `GEMINI_API_KEY` | AI assistant (primary and fallback) |
| `RESEND_API_KEY` | Transactional email |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret |
| `FRONTEND_URL` | Public frontend URL, used for CORS and email links |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | Global rate limit |

## Project structure

```
project-atlas/
├── index.html, manifest.json, sw.js   SPA shell, PWA manifest, service worker
├── css/global.css
├── js/
│   ├── screens/       Feed, Chat, Calendar, Notes, Files, AI, Admin, Settings…
│   ├── components/    App shell, call overlay, command palette, shortcuts
│   ├── config/        API configuration
│   └── api.js, router.js, store.js, socket.js, webrtc.js, pwa.js, offline.js
├── backend/
│   ├── src/
│   │   ├── config/        Env, MongoDB, Redis, Cloudinary
│   │   ├── controllers/   Route handlers
│   │   ├── middleware/    Auth, validation, sanitization, uploads, errors, logging
│   │   ├── models/        Mongoose schemas
│   │   ├── repositories/  Data access
│   │   ├── routes/        REST routes
│   │   ├── services/      Business logic
│   │   ├── sockets/       Chat, notifications, presence
│   │   └── app.js
│   ├── tests/
│   └── server.js
└── 1.txt … 5.txt      Original product specification
```

## License

© 2026 HellenicDev. All rights reserved.

Built by [HellenicDev](https://hellenicdev.eu).
