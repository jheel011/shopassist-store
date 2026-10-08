# ShopAssist AI

A modern e-commerce site with an integrated AI shopping assistant.
**React + Vite · Firebase Auth · Cloud Firestore · Gemini (via a serverless function) · Lucide icons.**

```
React (Vite)
   ↓
Firebase Authentication
   ↓
Cloud Firestore  ──►  products · orders · returns · policies · users
   ↓
Netlify serverless function  (holds GEMINI_API_KEY, never sent to the browser)
   ↓
ShopAssist AI chatbot
```

## What's included

| Area | Features |
| --- | --- |
| Home | Hero, trust stats, benefits, trending products (from Firestore), category cards with live counts, "Don't search. Just ask." AI section, testimonials, footer |
| Shop | Search, category chips, min/max price + presets, sort (price ↑↓, rating, popularity), in-stock / saved filters, wishlist, quick view, skeletons, empty + error states |
| Product page | Gallery, rating, price / old price / discount, stock status, quantity, Add to cart, Buy now, wishlist, delivery estimate, return policy (from Firestore), specs, related products |
| Cart & checkout | Add / remove / ±quantity, subtotal, discount, delivery fee (free over ₹999), total, persisted in `localStorage`; checkout writes a real order and decrements stock |
| Orders | Payment summary, status filters, tracking timeline, payment + delivery details, request a return, cancel (while Processing), return history |
| Auth | Firebase email/password, plus one-click demo users **Rahul** and **Priya** (switchable from the navbar) |
| ShopAssist AI | Floating animated chat. Answers from the live catalogue, **the signed-in user's own orders/returns**, and store policies. Product replies render as clickable cards |
| Extras | Policies page (from Firestore), About page, toasts, page transitions, mobile drawer menu |

## 1. Firebase setup (5 minutes)

1. Go to the [Firebase console](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (production mode is fine).
4. **Firestore → Rules** → paste the contents of `firestore.rules` → **Publish**.
5. **Project settings → Your apps → Add app → Web (`</>`)**, then copy the config values.
6. Copy `.env.example` to `.env` and fill in the six `VITE_FIREBASE_*` values.

## 2. Gemini key

Get a key from [Google AI Studio](https://aistudio.google.com/apikey) and add it as `GEMINI_API_KEY`.

- **Locally:** put it in `.env` (no `VITE_` prefix) and run with the Netlify CLI (below).
- **Deployed:** Netlify → Site settings → Environment variables → add `GEMINI_API_KEY`.

The key is only ever read inside `netlify/functions/chat.mjs`.

## 3. Run it

```bash
npm install

# Option A — full stack incl. the AI function (recommended)
npm install -g netlify-cli
netlify dev          # opens http://localhost:8888

# Option B — frontend only
npm run dev          # chat falls back to a simple offline mode (no Gemini)
```

## 4. Load the demo data

Open the site and click **Sign in → Continue as Rahul** (or Priya).
The first demo sign-in automatically seeds Firestore with **21 products, 5 policies and sample orders/returns** for that user — nothing to import by hand. If the catalogue is empty, the Home and Shop pages also show a **Load demo data** button.

Demo users' orders cover every state: Processing, Shipped, Out for Delivery, Delivered (inside and outside the return window), plus a refunded return for Priya.

## 5. Deploy to Netlify

1. Push this repo to GitHub.
2. Netlify → **Add new site → Import from Git**. Build settings are read from `netlify.toml`.
3. Add all seven environment variables from `.env.example`.
4. Firebase console → **Authentication → Settings → Authorized domains** → add your Netlify domain.

## Project structure

```
netlify/functions/chat.mjs   Gemini proxy (server-side key)
src/
  firebase.js                Firebase init (reads VITE_ env vars)
  context/                   Auth, cart + wishlist, toasts
  services/db.js             All Firestore reads/writes
  data/seed.js               Demo data (used only for seeding Firestore)
  components/                Navbar, ProductCard, QuickView, Chatbot, …
  pages/                     Home, Shop, ProductDetail, Cart, Checkout, Orders, …
  styles.css                 Design system
firestore.rules              Demo-grade security rules
```

## Notes for your viva / demo

- **No product is hardcoded in a component** — every grid reads from Firestore. `src/data/seed.js` only exists to populate the database.
- **The chatbot is grounded:** the function passes the catalogue, the user's orders and the policies to Gemini and instructs it to answer only from that data.
- **Security:** the Gemini key stays server-side. The included Firestore rules are *demo-grade* (any signed-in user can read/write) — before real use, restrict `orders` and `returns` to `request.auth.uid == resource.data.userId`.
- **Demo accounts** use a shared password in `src/data/seed.js`. Fine for an exhibition; remove for production.
- Payments are simulated — no card details are collected.
- Product photos load from Unsplash; if one fails, a category-tinted placeholder appears instead.
