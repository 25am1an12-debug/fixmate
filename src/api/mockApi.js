// ------------------------------------------------------------------
// FixMate API layer (MOCK)
// Every backend call in the app goes through this module.
// When the Node/Express backend is ready, reimplement these functions
// with fetch('/api/...') — the UI does not need to change.
// ------------------------------------------------------------------

import { services } from '../data/services.js';

const LS_USERS = 'fixmate_users';
const LS_OTPS = 'fixmate_otps';
const LS_BOOKINGS = 'fixmate_bookings';
const OTP_TTL_MS = 5 * 60 * 1000;
export const DEMO_OTP = '123456'; // dev only — remove with real SMS gateway

const read = (k, fb) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));
const uid = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// ------------------------------- OTP -------------------------------
export async function sendOtp(phone) {
  await delay(600);
  const code = DEMO_OTP; // dev: fixed demo code
  const otps = read(LS_OTPS, {});
  otps[phone] = { code, expiresAt: Date.now() + OTP_TTL_MS };
  write(LS_OTPS, otps);
  return { ok: true, demoCode: code, ttlSec: OTP_TTL_MS / 1000 };
}

export async function verifyOtp(phone, code) {
  await delay(600);
  const otps = read(LS_OTPS, {});
  const rec = otps[phone];
  if (!rec) return { ok: false, error: 'No OTP was sent to this number. Please resend.' };
  if (Date.now() > rec.expiresAt) return { ok: false, error: 'OTP expired. Please request a new one.' };
  if (String(code).trim() !== String(rec.code)) return { ok: false, error: 'Incorrect OTP. Please try again.' };
  delete otps[phone];
  write(LS_OTPS, otps);
  return { ok: true };
}

// ------------------------------ USERS ------------------------------
export async function registerUser({ name, phone, role, extra = {} }) {
  await delay(700);
  const users = read(LS_USERS, []);
  if (users.some((u) => u.phone === phone)) {
    return { ok: false, error: 'This phone number is already registered. Please log in.' };
  }
  const user = { id: uid('usr'), name, phone, role, ...extra, createdAt: new Date().toISOString() };
  users.push(user);
  write(LS_USERS, users);
  return { ok: true, user };
}

export async function loginWithPhone(phone) {
  await delay(500);
  const users = read(LS_USERS, []);
  const user = users.find((u) => u.phone === phone);
  if (!user) return { ok: false, error: 'No account found for this number. Please register first.' };
  return { ok: true, user };
}

// ----------------------------- SERVICES -----------------------------
export async function getServices() {
  await delay(200);
  return { ok: true, services };
}

// ----------------------------- BOOKINGS -----------------------------
export async function createBooking({ userId, serviceId, variant, dateISO, slot, address }) {
  await delay(700);
  const svc = services.find((s) => s.id === serviceId);
  const bookings = read(LS_BOOKINGS, []);
  const booking = {
    id: uid('BK').toUpperCase(),
    userId, serviceId,
    serviceName: svc?.name ?? serviceId,
    variant, dateISO, slot, address,
    amount: svc?.price ?? 0,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  bookings.unshift(booking);
  write(LS_BOOKINGS, bookings);
  return { ok: true, booking };
}

export async function getBookings(userId) {
  await delay(300);
  const bookings = read(LS_BOOKINGS, []);
  return { ok: true, bookings: bookings.filter((b) => b.userId === userId) };
}
