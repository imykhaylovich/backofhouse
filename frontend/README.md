# Back of House — frontend

React 19 + Vite + Tailwind v4 + react-router + axios. Warm-minimal UI in the spirit of Apple/Anthropic: ivory background, serif display type, one primary action per screen.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

The backend must be running on `http://localhost:8000` (override with `VITE_API_URL` in a `.env.local`). CORS on the backend allows origin `5173` only, so keep the default Vite port.

## What's where

```
src/
  api/client.js          axios instance + all endpoint helpers + error text
  auth/AuthContext.jsx   token, org profile (localStorage), onboarding flag
  components/            ui.jsx primitives · Shell.jsx nav · LowStockAlert.jsx
  pages/                 Landing, Login, Register, Onboarding, Dashboard,
                         Inventory, Orders, Donations, Distributions,
                         Reports, AskClaude
```

Org-type awareness: cafés/restaurants/bakeries/bars see **Orders**; nonprofits see **Donations + Distributions**. The type is chosen at registration (or in onboarding after a sign-in on a fresh browser, since the API has no `/auth/me`).

## Notes for Ivan (backend contract the UI expects)

Already working and verified end-to-end: `/auth/register`, `/inventory` (+ `/low-stock`), `/orders` (enum `type`: incoming|outgoing; `status`: pending|confirmed|fulfiled|cancelled), `/donations` (+stock), `/distributions` (−stock, 400 on shortfall).

Still needed — the UI is built and degrades gracefully until these ship:

1. **`POST /auth/login`** — body `{email, password}` (your `UserLogin` schema) → `Token`. Until then the Login page explains itself; only register works.
2. **`GET /reports/`** → `list[ReportResponse]`.
3. **`POST /claude/chat`** — body `{content}` (your `ChatMessageCreate`) → `ChatMessageResponse`.

Also: pin `bcrypt<4.1` in `requirements.txt` — with bcrypt 5.x, passlib 1.7.4 crashes on every hash (`ValueError: password cannot be longer than 72 bytes`), which 500s `/auth/register` on any fresh install.
