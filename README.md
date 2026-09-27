# Unique Designs — Women's & Girls' Fashion E-Commerce

A full-stack e-commerce web application for women's, girls', and child girls' fashion, with a
separate customer storefront and a secure role-based admin panel.

## ⚠️ Before you start

This codebase was written by an AI assistant in a sandbox **with no network access and no running
PostgreSQL instance**, so it has not been installed, migrated, or run end-to-end. Treat this as a
complete, carefully-written first implementation that you should install and test locally — not as
a live-verified build. Read through the code (especially `server/prisma/schema.prisma` and the auth
flow) before deploying it anywhere real.

## Tech Stack

- **Frontend:** React 18, Vite, React Router DOM, Tailwind CSS, Axios, react-hot-toast
- **Backend:** Node.js, Express.js, JWT auth, bcrypt, Multer, Nodemailer
- **Database:** PostgreSQL + Prisma ORM

## Features

- Customer registration/login (email or mobile), JWT auth, protected routes
- Secure forgot-password flow: hashed, expiring, attempt-limited OTP emailed via Nodemailer
- User profile management with profile image upload
- Product catalog with search, filters (category, price, discount, size, color, stock), sorting, pagination
- Multi-image product uploads with add/remove/replace
- Flexible discount engine (percentage or fixed amount) with automatic final-price calculation
- Wishlist and cart, including a guest cart (localStorage) that merges into the account cart on login
- Role-based admin panel (`SUPER_ADMIN`, `ADMIN`) — dashboard stats, product/category/user/admin management
- Centralized error handling, rate limiting, Helmet security headers, input validation throughout

## Requirements

- Node.js 18+
- PostgreSQL 14+
- A Gmail account (or other SMTP provider) for sending OTP emails

## 1. Database Setup

```bash
# In psql or your preferred client
CREATE DATABASE unique_designs;
```

## 2. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, SUPER_ADMIN_EMAIL/PASSWORD, SMTP_* values

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed        # creates the 14 starter categories + the Super Admin account
npm run dev         # starts the API on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

### Gmail App Password (for Nodemailer)

Regular Gmail passwords won't work with SMTP. Generate an **App Password**:
1. Enable 2-Step Verification on the Google account.
2. Go to Google Account → Security → App Passwords.
3. Generate a password for "Mail" and use it as `SMTP_PASSWORD` in `.env`.

## 3. Frontend Setup

```bash
cd client
cp .env.example .env
# Edit VITE_API_BASE_URL if your backend isn't on localhost:5000

npm install
npm run dev          # starts the app on http://localhost:5173
```

## Default Admin Login

After `npm run seed` (or the server's first boot), log in at `/admin/login` with the
`SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` you set in `server/.env`. Change this password
immediately in production.

## Folder Structure

```
unique-designs/
├── client/                 React + Vite frontend
│   └── src/
│       ├── components/     Navbar, Footer, ProductCard, shared UI
│       ├── pages/           Public + user pages
│       ├── admin/          Admin panel pages
│       ├── context/        Auth & Cart React context
│       └── services/       Axios client + API endpoint functions
├── server/                 Express backend
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/     auth, authorize, upload, error handling
│       ├── services/       emailService (Nodemailer)
│       ├── validators/
│       └── utils/          jwt, otp, discount calc, prisma client
│   └── prisma/
│       ├── schema.prisma
│       └── seed.js
└── README.md
```

## Key API Endpoints

See `server/src/routes/*.js` for the full list. Highlights:

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/verify-otp
POST /api/auth/reset-password

GET  /api/products?search=&category=&sort=&page=
GET  /api/products/:id

GET  /api/admin/dashboard   (ADMIN/SUPER_ADMIN only)
POST /api/admin/create-admin  (SUPER_ADMIN only)
```

## Known Limitations / Next Steps

- **Not tested end-to-end** — run it locally, watch the terminal/browser console, and fix anything
  that surfaces (dependency version drift between when this was written and when you install is the
  most likely source of small issues).
- No payment gateway/checkout flow is implemented — the cart computes totals and stock correctly,
  but "Proceed to Checkout" is a placeholder, since it wasn't in scope.
- No automated test suite (Section 61 in the original spec calls for manual test coverage — no
  Jest/Playwright tests were written).
- Image storage is local disk (`server/uploads/`); for production, swap in S3/Cloudinary.
- Rate limiting and email sending are best-effort — review the limits in `authRoutes.js` for your traffic.

## Troubleshooting

- **"Can't reach database server"** — check `DATABASE_URL` and that PostgreSQL is running.
- **OTP emails not arriving** — check spam folder, verify the Gmail App Password, check server logs.
- **CORS errors** — make sure `CLIENT_URL` in `server/.env` matches the frontend's actual origin.
- **401 on every request** — the JWT may have expired or `JWT_SECRET` changed; log in again.
