// ------------------------------------------------------------------
// FixMate API client
// Talks to the real Node/Express backend when VITE_API_URL is set,
// otherwise falls back to the offline mock API (mockApi.js).
// The UI uses only the functions below, so the backend can evolve
// without touching any component.
// ------------------------------------------------------------------
import * as mock from './mockApi.js';

const BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:5000
const USE_MOCK = !BASE;
const LS_TOKEN = 'fixmate_token';

export const DEMO_OTP = mock.DEMO_OTP;

function authHeaders() {
  const t = localStorage.getItem(LS_TOKEN);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function req(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Backend down / unreachable: fail with a readable message instead of
    // throwing, so callers can show it instead of failing silently.
    return { ok: false, error: 'Could not reach the server. Is the backend running?' };
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    return { ok: false, error: data.error || `Request failed (${res.status}).` };
  }
  return { ok: true, ...data };
}

export function clearToken() {
  localStorage.removeItem(LS_TOKEN);
}

// ------------------------------- OTP -------------------------------
export async function sendOtp(phone) {
  if (USE_MOCK) return mock.sendOtp(phone);
  return req('/api/auth/otp/request', { method: 'POST', body: { phone } });
}

// regData = { name, phone, role, extra: { profession } } for new registrations.
// Real backend verifies + registers in one call; mock mode verifies only
// (the modal then calls registerUser / loginWithPhone as before).
export async function verifyOtp(phone, code, regData = null) {
  if (USE_MOCK) return mock.verifyOtp(phone, code);
  const body = regData
    ? { phone, code, name: regData.name, role: regData.role, profession: regData.extra?.profession || '' }
    : { phone, code };
  const r = await req('/api/auth/otp/verify', { method: 'POST', body });
  if (!r.ok) return r;
  localStorage.setItem(LS_TOKEN, r.token);
  return { ok: true, user: r.user };
}

// ------------------------- FIREBASE PHONE -------------------------
// After Firebase verifies the SMS OTP on the client, we hand its ID
// token to our backend, which verifies it with firebase-admin and
// returns our own JWT (same session format as the OTP flow).
export async function firebaseLogin(idToken, regData = null) {
  if (USE_MOCK) return { ok: false, error: 'Firebase login needs the real backend.' };
  const body = regData
    ? { idToken, name: regData.name, role: regData.role, profession: regData.extra?.profession || '' }
    : { idToken };
  const r = await req('/api/auth/firebase', { method: 'POST', body });
  if (!r.ok) return r;
  localStorage.setItem(LS_TOKEN, r.token);
  return { ok: true, user: r.user };
}

// ------------------------------ USERS ------------------------------
export async function registerUser(data) {
  if (USE_MOCK) return mock.registerUser(data);
  return { ok: false, error: 'Registration happens inside verifyOtp.' };
}

export async function loginWithPhone() {
  if (USE_MOCK) return mock.loginWithPhone(...arguments);
  const r = await req('/api/auth/me');
  if (!r.ok) return r;
  return { ok: true, user: r.user };
}

// ----------------------------- SERVICES -----------------------------
export async function getServices() {
  if (USE_MOCK) return mock.getServices();
  return req('/api/services');
}

// ----------------------------- BOOKINGS -----------------------------
export async function createBooking(b) {
  if (USE_MOCK) return mock.createBooking(b);
  const r = await req('/api/bookings', {
    method: 'POST',
    body: { serviceId: b.serviceId, variant: b.variant, dateISO: b.dateISO, slot: b.slot, address: b.address },
  });
  if (!r.ok) return r;
  return { ok: true, booking: r.booking };
}

export async function getBookings(userId) {
  if (USE_MOCK) return mock.getBookings(userId);
  return req('/api/bookings');
}
