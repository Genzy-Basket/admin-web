# Genzy Basket — Admin Web

Admin console for reviewing partner KYC submissions.

Built with React 19, Vite, Tailwind CSS 4 and React Router.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your API
npm run dev            # http://localhost:5174
```

## Environment

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the backend API, including the `/api/v1` prefix |

Only variables prefixed with `VITE_` are exposed to the client, and they are
baked into the bundle at build time — never put a secret in one.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run preview` | Serve the production build locally |

## Features

- Admin sign in: email and password, followed by an OTP second factor
- Dashboard with partner and KYC document counts
- KYC review queue filtered by pending, approved or rejected
- Per-document approve and reject, with a required reason on reject

Admin accounts are seeded from the backend; there is no self-registration.
