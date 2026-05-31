# Nano URL - Full Stack URL Shortener

Nano URL is a full-stack URL shortener with user accounts, custom aliases, password-protected links, QR codes, and click analytics. The project is split into an Express/MongoDB backend and a Vite React frontend.

## Project Structure

```text
URL_Shortener/
|-- backend/          # Express API, MongoDB models, auth, redirects, analytics
|-- frontend/         # React + Vite client
`-- render.yaml       # Render deployment config for the backend
```

## Features

- Shorten public links without logging in
- Create an account and manage saved links
- Use custom aliases for short URLs
- Add optional expiry dates
- Protect short links with a password
- Generate QR codes for shortened links
- Track clicks by country, device, browser, OS, and date
- Edit and delete authenticated user links
- Update profile and account settings
- Cookie-based JWT authentication

## Tech Stack

### Backend

- Node.js 20
- Express 5
- MongoDB with Mongoose
- JWT auth stored in HTTP-only cookies
- bcryptjs for password hashing
- qrcode for QR generation
- geoip-lite and ua-parser-js for analytics
- Helmet, CORS, rate limiting, and input sanitization

### Frontend

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4
- Axios
- Framer Motion
- Recharts
- react-hot-toast
- qrcode.react

## Prerequisites

- Node.js 20.x
- npm
- MongoDB Atlas connection string or a local MongoDB URI

## Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173
```

Create a `.env` file inside `frontend/` when you want to override the default deployed API:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run Locally

Install and start the backend:

```bash
cd backend
npm install
npm run dev
```

Install and start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at:

```text
http://localhost:5173
```

The API runs at:

```text
http://localhost:5000
```

## Main API Routes

| Method | Route | Description |
| --- | --- | --- |
| GET | `/health` | API health check |
| POST | `/api/auth/signup` | Create a user account |
| POST | `/api/auth/login` | Log in and set auth cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current authenticated user |
| PATCH | `/api/auth/profile` | Update profile/settings |
| POST | `/api/url/shorten` | Create a short URL |
| GET | `/api/url/history` | Get authenticated user's links |
| PUT | `/api/url/:id` | Update a saved link |
| DELETE | `/api/url/:id` | Delete a saved link |
| GET | `/api/analytics/:id` | Get analytics for a saved link |
| GET | `/r/:shortCode` | Redirect to original URL |
| GET | `/:shortCode` | Redirect to original URL |

## Deployment

The repository includes `render.yaml` for deploying the backend on Render. The current config expects these secret environment variables on Render:

- `MONGO_URI`
- `JWT_SECRET`

The frontend includes `vercel.json` and SPA redirects for Vercel/Netlify-style deployment. Set this variable in the frontend host:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

For production cookies and CORS, ensure the backend has:

```env
NODE_ENV=production
BASE_URL=https://your-backend-domain.com
CLIENT_URL=https://your-frontend-domain.com
CLIENT_URLS=https://your-frontend-domain.com
```

## Useful Commands

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

- The backend requires `MONGO_URI`, `JWT_SECRET`, `BASE_URL`, and either `CLIENT_URL` or `CLIENT_URLS` before it starts.
- In development, the backend automatically allows `http://localhost:5173` and `http://127.0.0.1:5173` for CORS.
- The frontend Vite server proxies `/api` requests to `http://localhost:5000`.
