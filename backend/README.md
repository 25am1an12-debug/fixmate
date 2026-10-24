# FixMate Backend

Node/Express + MongoDB API for the FixMate home-services platform.

## Setup (step by step)

### 1. Create a free MongoDB database
1. Go to https://cloud.mongodb.com and sign up (free).
2. Create a **free M0 cluster** (takes 2–3 minutes).
3. Click **Connect → Drivers → Node.js** and copy the connection string.
   It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/...`
4. Replace `<username>` and `<password>` with the database user you created
   (Database Access → Add New Database User).

### 2. Configure environment
```bash
cd backend
cp .env.example .env
```
Open `.env` and paste your connection string as `MONGODB_URI`.
Change `JWT_SECRET` to any long random string.

### 3. Install & run
```bash
npm install
npm run dev
```
You should see:
```
✅ MongoDB connected
🔧 FixMate API running on http://localhost:5000
```

### 4. Connect the frontend
In the frontend folder, create `.env`:
```
VITE_API_URL=http://localhost:5000
```
Then `npm run dev` — the app now talks to the real backend.
(Without `VITE_API_URL` it falls back to the offline mock API.)

## Firebase Phone Auth (real SMS OTP)

The frontend can send real SMS OTPs via Firebase Phone Auth when the
`VITE_FIREBASE_*` vars are set (see the frontend `.env.example`).

For the backend to trust Firebase logins, it must verify the ID token
with a service-account key:

1. Firebase console → **Project Settings** → **Service accounts**
2. Click **Generate new private key** → a JSON file downloads.
3. Save it as `backend/serviceAccountKey.json` (same folder as `server.js`).
   ⚠️ Keep it private — never commit it or share it.
4. Restart the backend (`npm run dev`).

`POST /api/auth/firebase` will then verify the token, find-or-create the
user by phone number, and return the usual `{ token, user }` session.
Without the key file, that endpoint returns a 501 error explaining this.

## API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| GET | `/api/services` | — | Service catalog |
| POST | `/api/auth/otp/request` | — | `{ phone }` → sends OTP |
| POST | `/api/auth/otp/verify` | — | `{ phone, code, name?, role?, profession? }` → `{ token, user }` |
| POST | `/api/auth/firebase` | — | `{ idToken, name?, role?, profession? }` → `{ token, user }` (needs service-account key) |
| GET | `/api/auth/me` | Bearer | Current user |
| POST | `/api/bookings` | Bearer | Create a booking |
| GET | `/api/bookings` | Bearer | My bookings |

Protected routes need the header: `Authorization: Bearer <token>`

## Demo OTP

With `DEMO_OTP=true` (default), `/otp/request` returns the code in the
response so you can test without an SMS gateway. Set `DEMO_OTP=false` in
production and wire a real provider (MSG91 / Twilio / Firebase) in
`routes/auth.js` where marked TODO.
