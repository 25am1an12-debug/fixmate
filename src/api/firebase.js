// ------------------------------------------------------------------
// Firebase Phone Auth helper (real SMS OTP via Google Firebase)
// Config comes from VITE_FIREBASE_* env vars (see .env.example).
// If any var is missing, isFirebaseConfigured() is false and the app
// silently falls back to the built-in demo OTP flow.
// ------------------------------------------------------------------
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return !!(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
}

let app = null;
let confirmationResult = null;

function getFirebaseAuth() {
  if (!isFirebaseConfigured()) throw new Error('Firebase is not configured.');
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(cfg);
  }
  return getAuth(app);
}

function freshVerifier(auth) {
  // Always start from a brand-new container element. Firebase throws
  // "reCAPTCHA has already been rendered in this element" if a previous
  // invisible widget is still attached to the same DOM node, so we remove
  // the old node entirely instead of reusing it.
  try { window.__fixmateRecaptcha?.clear?.(); } catch { /* ignore */ }
  window.__fixmateRecaptcha = null;
  const old = document.getElementById('recaptcha-container');
  if (old) old.remove();
  const el = document.createElement('div');
  el.id = 'recaptcha-container';
  el.style.cssText = 'position:absolute;left:-9999px;top:0;';
  document.body.appendChild(el);
  const v = new RecaptchaVerifier(auth, el, { size: 'invisible' });
  window.__fixmateRecaptcha = v;
  return v;
}

// Sends a real SMS OTP to +91XXXXXXXXXX. Resolves when the SMS is sent.
export async function sendFirebaseOtp(phone10) {
  const auth = getFirebaseAuth();
  const verifier = freshVerifier(auth);
  confirmationResult = await signInWithPhoneNumber(auth, `+91${phone10}`, verifier);
  return { ok: true };
}

// Verifies the 6-digit code typed by the user. Resolves with the
// Firebase ID token, which the backend verifies before issuing our JWT.
export async function verifyFirebaseOtp(code) {
  if (!confirmationResult) throw new Error('Please request an OTP first.');
  const cred = await confirmationResult.confirm(String(code).trim());
  const idToken = await cred.user.getIdToken();
  confirmationResult = null;
  return { ok: true, idToken, phone: cred.user.phoneNumber };
}
