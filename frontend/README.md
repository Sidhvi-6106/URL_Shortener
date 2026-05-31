# Nano URL Frontend

This is the React frontend for Nano URL. It provides the user interface for shortening links, signing up, logging in, managing saved URLs, viewing analytics, editing profile settings, and resolving protected redirects.

## Tech Stack

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4
- Axios
- Framer Motion
- Recharts
- react-hot-toast
- qrcode.react

## Folder Structure

```text
frontend/
|-- public/              # Static assets and SPA redirects
|-- src/
|   |-- api/             # Axios client and API helpers
|   |-- components/      # Shared UI components
|   |-- context/         # Auth context
|   |-- hooks/           # Custom hooks
|   |-- layouts/         # Page layout
|   |-- pages/           # Route pages
|   |-- routes/          # Route guards
|   |-- App.jsx          # App routes
|   |-- index.css        # Tailwind and global styles
|   `-- main.jsx         # React entry point
|-- vite.config.js
|-- vercel.json
|-- package.json
`-- package-lock.json
```

## Features

- Landing page with URL shortening form
- Login and signup pages
- Protected dashboard
- User profile page
- Profile/settings editor
- Saved URL cards with edit/delete actions
- QR code modal
- Analytics views with charts
- Redirect resolution page for `/r/:shortCode`
- Toast notifications and loading states

## Environment Variables

Create a `.env` file in `frontend/` if you need to override the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

If `VITE_API_URL` is not provided, the app defaults to:

```text
https://url-shortener-19le.onrender.com/api
```

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

The Vite config proxies `/api` requests to:

```text
http://localhost:5000
```

For the best local setup, run the backend on port `5000` and set:

```env
VITE_API_URL=http://localhost:5000/api
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production bundle |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Routes

| Route | Description |
| --- | --- |
| `/` | Home page and public URL shortener |
| `/login` | User login |
| `/signup` | User registration |
| `/dashboard` | Protected saved-link dashboard |
| `/profile` | Protected profile page |
| `/settings` | Protected profile settings |
| `/r/:shortCode` | Client-side redirect resolver |
| `*` | Not found page |

## API Client

The Axios instance is defined in:

```text
src/api/axios.js
```

It uses:

- `withCredentials: true` for cookie-based auth
- `Content-Type: application/json`
- central error handling that exposes `userMessage`

## Deployment

The app includes `vercel.json` for SPA rewrites:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

For deployment, set:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

Make sure the backend also allows the deployed frontend URL through `CLIENT_URL` or `CLIENT_URLS`.
