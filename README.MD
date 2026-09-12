# Bol Proteinis — Online Ordering App

A MERN-stack web app for browsing the weekly menu (protein bowls, salads, smoothies, sandwiches) and placing orders online. Built with MongoDB, Express, React (Vite), and Node.js.

## Features

- Weekly menu display with nutrition facts, pulled live from the database
- Serving-size selection (1 or 2 servings) with nutrition and price scaling accordingly
- Cart with quantity controls (add, increase, decrease, remove) — duplicate items merge into a single line instead of listing twice
- Customer order form capturing name, email, phone, residential community, and flat/villa number
- Automatic order notifications by **email** (styled HTML, sent to both the customer and the restaurant) and **WhatsApp** (sent to the restaurant, via Twilio)
- Admin-ready backend routes for managing menu items and viewing orders

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Atlas recommended) |
| Email | Nodemailer (Gmail) |
| WhatsApp | Twilio WhatsApp API |
| Hosting | Vercel (frontend) + Render (backend) |

## Project structure

```
bol-proteinis/
├── server/
│   ├── models/          MenuItem, Order (Mongoose schemas)
│   ├── routes/          menuRoutes, orderRoutes
│   ├── utils/           sendEmail, sendWhatsApp, emailTemplate
│   ├── seed.js          Populates the DB with this week's menu
│   ├── server.js        Express app entry point
│   └── .env             Your secrets (never commit this)
├── client/
│   ├── src/
│   │   ├── assets/       Logo image
│   │   ├── data/         communities.js (residential community list)
│   │   ├── components/   WeeklyMenu, OrderForm
│   │   └── pages/        OrderPage
│   └── .env              Frontend config (never commit this)
└── .gitignore
```

## Prerequisites

- Node.js v18+
- A MongoDB Atlas account (free tier is enough)
- A Gmail account (for sending order emails)
- A Twilio account (for WhatsApp notifications)

## Setup

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env` with the variables listed below, then:

```bash
node seed.js       # populates the menu — run once, or whenever the menu changes
npm run dev        # starts the server (requires "dev": "nodemon server.js" in package.json scripts)
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## Environment variables

### `server/.env`

| Variable | What it's for | Where to get it |
|---|---|---|
| `MONGODB_URI` | Connection string for your database | MongoDB Atlas → Database → Connect → Drivers |
| `PORT` | Port the backend runs on (optional, defaults to 8080) | Your choice |
| `EMAIL_USER` | Gmail address used to send order emails | Your own Gmail address |
| `EMAIL_PASS` | Gmail **App Password** (not your regular password) | Google Account → Security → 2-Step Verification → App Passwords |
| `ADMIN_EMAIL` | Email address that receives new-order notifications | Your restaurant's inbox |
| `TWILIO_SID` | Twilio Account SID | Twilio Console home page |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Twilio Console home page (click "Show" to reveal) |
| `TWILIO_WHATSAPP_FROM` | The WhatsApp number Twilio sends from | Twilio Console → Messaging → Try WhatsApp (sandbox number while testing) |
| `ADMIN_WHATSAPP` | Your WhatsApp number that receives order alerts | Format: `+91XXXXXXXXXX`. Must first send "join `<code>`" to the sandbox number from this number |

### `client/.env`

| Variable | What it's for |
|---|---|
| `VITE_API_URL` | The backend's URL. Use `http://localhost:8080` locally, or your deployed Render URL in production |

**Never commit either `.env` file.** They're already excluded in `.gitignore` — double-check they don't show up on GitHub after you push.

## WhatsApp notifications — current limitation

Twilio's WhatsApp **sandbox** (used for testing) can only message numbers that have joined it by texting "join `<code>`" — so it currently notifies the restaurant's own number, not customers automatically. Sending to real customers requires an approved WhatsApp Business sender through Twilio (a short business-verification process), which is a planned next step, not yet live.

## Deployment

- **Backend** → deploy `server/` to [Render](https://render.com) as a Web Service, with all the env variables above added in its dashboard.
- **Frontend** → deploy `client/` to [Vercel](https://vercel.com), with `VITE_API_URL` set to your Render backend's URL.

## Roadmap

- [ ] Razorpay integration for online payment
- [ ] Admin dashboard for updating the weekly menu without editing `seed.js`
- [ ] Approved WhatsApp sender for customer-facing order confirmations
- [ ] Order status tracking (pending → preparing → delivered)