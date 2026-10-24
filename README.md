# FixMate — Home Services, Fixed Right

A professional home-service platform frontend built with **React + Vite**.

## Features

- **Navbar** with Login button wired to an auth modal
- **Customer / Professional registration** with role selection
- **OTP verification** (mock OTP in dev — swap with real SMS gateway later)
- **Service booking flow** — pick a service, choose date/time slot, add address, confirm
- **Auth state** via React Context, persisted to localStorage
- **Mock API layer** (`src/api/mockApi.js`) — every backend call goes through one module,
  so plugging in the real Node/Express backend later means changing one file, not the UI

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
```

## Demo OTP

In development the mock API logs the OTP to the on-screen demo hint.
Default demo OTP: **123456** (any 6-digit code shown in the hint works).

## Roadmap

- [ ] Node/Express + database backend (`/backend`)
- [ ] Real SMS OTP gateway
- [ ] Professional onboarding / KYC
- [ ] Payments (UPI / cards)
- [ ] Booking tracking & ratings
