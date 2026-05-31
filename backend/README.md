# Nano URL Backend

This is the Express API for Nano URL. It handles authentication, URL shortening, redirects, QR code generation, link protection, user profile updates, and analytics.

## Tech Stack

- Node.js 20
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens
- HTTP-only cookies
- bcryptjs
- qrcode
- geoip-lite
- ua-parser-js
- Helmet, CORS, rate limiting, and input sanitization

## Folder Structure

```text
backend/
|-- src/
|   |-- app.js                  # Express app, middleware, routes
|   |-- server.js               # Environment checks, DB connection, server startup
|   |-- config/                 # Database and JWT helpers
|   |-- controllers/            # Request handlers
|   |-- middleware/             # Auth, validation, rate limits, sanitization, errors
|   |-- models/                 # Mongoose schemas
|   |-- routes/                 # Express route definitions
|   `-- services/               # Shortener, analytics, QR helpers
|-- package.json
`-- package-lock.json
```

## Environment Variables

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173
```

Required variables:

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `BASE_URL` | Public backend URL used to build short links |
| `CLIENT_URL` or `CLIENT_URLS` | Allowed frontend origin(s) for CORS |

Optional variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | API server port |
| `NODE_ENV` | unset | Use `production` for secure cross-site cookies |

## Installation

```bash
npm install
```

## Run Locally

Development with nodemon:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

## API Endpoints

### Health

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | API health check |
| GET | `/` | No | Basic API running message |

### Authentication

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | No | Create account and set auth cookie |
| POST | `/api/auth/login` | No | Log in and set auth cookie |
| POST | `/api/auth/logout` | No | Clear auth cookie |
| GET | `/api/auth/me` | Optional | Return current user or `null` |
| PATCH | `/api/auth/profile` | Yes | Update profile, settings, domains, or password |

### URLs

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/url/shorten` | Optional | Create a short URL |
| GET | `/api/url/history` | Yes | List the current user's saved URLs |
| PUT | `/api/url/:id` | Yes | Update a saved URL |
| DELETE | `/api/url/:id` | Yes | Delete a saved URL |
| GET | `/api/url/:shortCode` | No | Redirect by short code |
| GET | `/r/:shortCode` | No | Redirect by short code |
| GET | `/:shortCode` | No | Redirect by short code |

### Analytics

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/analytics/:id` | Yes | Return clicks, recent clicks, countries, browsers, devices, and daily trend |

## Short URL Request Example

```json
{
  "originalUrl": "https://example.com/long/path",
  "customAlias": "example",
  "expiryDate": "2026-12-31",
  "passwordProtected": false,
  "password": ""
}
```

## Security Notes

- Auth tokens are stored in HTTP-only cookies.
- Production cookies use `secure: true` and `sameSite: "none"`.
- CORS allows only configured client origins.
- Authentication and general API routes are rate limited.
- User input passes through sanitization and URL validation middleware.
- Passwords and protected-link passwords are hashed with bcrypt.

## Deployment

The root `render.yaml` is configured for Render:

```yaml
rootDir: backend
buildCommand: npm install
startCommand: npm start
```

On Render, set:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
BASE_URL=https://your-backend-domain.com
CLIENT_URL=https://your-frontend-domain.com
CLIENT_URLS=https://your-frontend-domain.com
```
