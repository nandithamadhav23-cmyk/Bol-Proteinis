# Bol Proteinis — Online Ordering App

A MERN-stack web app for browsing the weekly menu (protein bowls, salads, smoothies, sandwiches), placing orders as a guest or logged-in customer, subscribing to meal plans, and running the whole operation from an admin dashboard.

## Features

### Customer-facing
- **Guest ordering, zero login required** — scanning the menu QR code or visiting the site opens the menu directly; browsing and ordering never requires an account
- Weekly menu with nutrition facts that scale correctly with serving size (1 or 2 servings) — Glycemic Index stays fixed since it doesn't depend on quantity
- Cart with quantity controls; adding the same dish twice increases its quantity instead of duplicating the line
- **Optional customer accounts** (sign up / log in) unlocking:
  - Order history with live status and payment status
  - Meal plan subscriptions (Weekly/Monthly, cancel anytime)
  - Auto-filled checkout details
- **Payment options at checkout**: Cash on Delivery, or Pay Online via Razorpay (cards/UPI/wallets)
- **Order tracking page** (`/track/:id`) — no login needed, works from the emailed/WhatsApp'd link. Shows a step-by-step status timeline, estimated cook time once confirmed, and a "Pay online now" retry button if payment didn't go through
- Automatic notifications: a styled HTML **email** confirmation (sent once admin confirms the order) and a **WhatsApp** alert to the restaurant when an order comes in

### Admin-facing (`/admin`, behind login)
- **Order queue**: confirm pending orders with an estimated cook time (this is the moment the customer's confirmation email sends), then move orders through Preparing → Delivered, or cancel
- **Menu management**: add or delete menu items directly, no manual database editing or script needed
- **Customer list**: everyone who's created an account
- **Subscriber list**: everyone on an active meal plan
- **QR code generator**: generates and downloads a scannable code pointing at your live menu, ready to print for the counter
- At-a-glance stat cards: orders awaiting confirmation, today's revenue, active subscriber count, menu item count

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS + React Router + lucide-react icons |
| Backend | Node.js + Express |
| Database | MongoDB (Atlas recommended) |
| Auth | JWT (jsonwebtoken) + bcrypt password hashing |
| Payments | Razorpay (checkout + signature verification + webhook) |
| Email | Nodemailer (Gmail) |
| WhatsApp | Twilio WhatsApp API |
| QR codes | qrcode.react |
| Hosting | Vercel (frontend) + Render (backend) |

## Project structure

```
bol-proteinis/
├── server/
│   ├── models/
│   │   ├── MenuItem.js
│   │   ├── Order.js          customer/guest orders, payment + status tracking
│   │   ├── User.js           customer accounts (hashed passwords)
│   │   └── Subscription.js   meal plan subscriptions
│   ├── middleware/
│   │   └── auth.js           verifyToken, optionalAuth, requireAdmin
│   ├── routes/
│   │   ├── authRoutes.js         register / login / admin-login
│   │   ├── userRoutes.js         admin: list customers
│   │   ├── menuRoutes.js         public read, admin-only write
│   │   ├── orderRoutes.js        create/confirm/status/history, guest + account aware
│   │   ├── subscriptionRoutes.js customer subscribe/cancel, admin: list subscribers
│   │   ├── paymentRoutes.js      Razorpay order creation + payment verification
│   │   └── webhookRoutes.js      Razorpay webhook (payment.captured)
│   ├── utils/
│   │   ├── sendEmail.js          admin notification + customer confirmation emails
│   │   ├── emailTemplate.js      HTML email templates (card-style, cook time included)
│   │   ├── sendWhatsApp.js       Twilio WhatsApp notification to admin
│   │   └── razorpay.js           Razorpay client instance
│   ├── seed.js                populates the menu — run once, or whenever the menu changes
│   ├── server.js
│   └── .env
├── client/
│   ├── src/
│   │   ├── assets/            logo.jpg
│   │   ├── data/              communities.js (residential community list)
│   │   ├── context/
│   │   │   └── AuthContext.jsx    login state, authenticated fetch helper
│   │   ├── utils/
│   │   │   └── razorpayPayment.js shared checkout flow (used at checkout and on the tracking page)
│   │   ├── components/
│   │   │   ├── WeeklyMenu.jsx
│   │   │   ├── OrderForm.jsx
│   │   │   └── ProtectedRoute.jsx route guard for /dashboard and /admin
│   │   ├── pages/
│   │   │   ├── OrderPage.jsx         public menu + checkout (the "/" route)
│   │   │   ├── OrderStatusPage.jsx   order tracking ("/track/:id")
│   │   │   ├── CustomerAuth.jsx      login / sign up
│   │   │   ├── AdminAuth.jsx         admin login
│   │   │   ├── CustomerDashboard.jsx order history + subscriptions ("/dashboard")
│   │   │   └── AdminDashboard.jsx    orders/menu/customers/subscribers/QR ("/admin")
│   │   └── App.jsx            all routing
│   └── .env
└── .gitignore
```

## Setup

### 1. Backend

```bash
cd server
npm install
npm install jsonwebtoken bcryptjs razorpay
```

Create `server/.env` with the variables listed below, then:

```bash
node seed.js       # populates the menu — run once, or whenever the menu changes
npm run dev
```

**⚠️ Route ordering matters in `server.js`** — the Razorpay webhook route must be registered *before* `app.use(express.json())`, since it needs the raw request body to verify Razorpay's signature. See the comment at the top of `routes/webhookRoutes.js` for why.

### 2. Frontend

```bash
cd client
npm install
npm install react-router-dom lucide-react qrcode.react
npm run dev
```

## Environment variables

### `server/.env`

| Variable | What it's for | Where to get it |
|---|---|---|
| `MONGODB_URI` | Database connection string | MongoDB Atlas → Connect → Drivers |
| `PORT` | Backend port (optional, defaults to 8080) | Your choice |
| `JWT_SECRET` | Signs login tokens | Make up a long random string |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login credentials | Your choice |
| `EMAIL_USER` / `EMAIL_PASS` | Sends order emails via Gmail | `EMAIL_PASS` must be a Gmail **App Password**, not your real password — Google Account → Security → App Passwords |
| `ADMIN_EMAIL` | Where new-order alerts go | Your restaurant's inbox |
| `TWILIO_SID` / `TWILIO_AUTH_TOKEN` | WhatsApp notifications | Twilio Console home page |
| `TWILIO_WHATSAPP_FROM` | Sandbox number while testing | `+14155238886` (Twilio sandbox default) |
| `ADMIN_WHATSAPP` | Restaurant's WhatsApp, format `+91XXXXXXXXXX` | Must first send "join `<code>`" to the sandbox number |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payment processing | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Verifies webhook authenticity | Razorpay Dashboard → Webhooks → set when creating the webhook |

### `client/.env`

| Variable | What it's for |
|---|---|
| `VITE_API_URL` | Backend URL — `http://localhost:8080` locally, your Render URL in production |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key (safe to expose client-side) |

**Never commit either `.env` file** — already excluded in `.gitignore`.

## How the order lifecycle actually works

1. **Customer places an order** (guest or logged in) → status `pending`. Only the **admin** is notified (email + WhatsApp) — the customer does *not* get a confirmation yet.
2. **Admin opens `/admin` → Orders**, sets an estimated cook time, and clicks Confirm. This is the exact moment the **customer's confirmation email** sends, now including the cook time.
3. Admin advances the order through `preparing` → `delivered` (or `cancelled`) as it progresses. Every change is reflected instantly on the customer's tracking page.
4. **Payment** happens independently of order status: COD stays `pending` until delivery; Razorpay payments are marked `paid` the moment checkout succeeds (verified by signature) *and* again via webhook — so even if a customer's browser closes right after paying, the webhook still confirms it server-side.

## Known limitations / next steps

- **WhatsApp sandbox**: currently only notifies the admin's own number, since Twilio's free sandbox requires each recipient to manually "join" it. Sending WhatsApp confirmations to customers requires an approved WhatsApp Business sender (a short Meta business verification via Twilio).
- **Admin login** compares a plaintext password from `.env` — fine for a single-operator MVP, but should move to a hashed, database-backed admin account before wider use.
- **Razorpay account** must complete KYC with Razorpay before accepting real payments; until then, only test-mode payments work.
- **QR code** points at the homepage (the public menu) by default — editable per download from the admin QR Code tab.

## Deployment

- **Backend** → Render (Web Service, root directory `server`) — remember to add every environment variable above in Render's dashboard, and confirm the webhook route ordering note before deploying.
- **Frontend** → Vercel (root directory `client`) — set `VITE_API_URL` and `VITE_RAZORPAY_KEY_ID` as environment variables there.
- **Razorpay webhook** → once deployed, register `https://your-render-url.onrender.com/api/webhooks/razorpay` in the Razorpay Dashboard, subscribed to `payment.captured`.

## Roadmap

- [ ] Hash the admin password / move to a proper admin account
- [ ] Approved WhatsApp sender for customer-facing notifications
- [ ] Order refunds / cancellation-with-refund flow
- [ ] Admin editing of existing menu items (currently add/delete only)