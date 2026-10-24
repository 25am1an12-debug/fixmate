import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { User } from '../models/User.js';
import { Otp } from '../models/Otp.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();
const DEMO_MODE = process.env.DEMO_OTP !== 'false';

// ---- Firebase Admin (lazy) -------------------------------------------
// Verifies the ID token the frontend got from Firebase Phone Auth.
// Needs a service-account key: Firebase console -> Project Settings ->
// Service accounts -> Generate new private key -> save as
// backend/serviceAccountKey.json (see FIREBASE_SERVICE_ACCOUNT_PATH).
// NOTE (firebase-admin v14): the legacy namespace API was removed —
// admin.credential.cert() and admin.auth() no longer exist. v14 uses the
// modular entry points: initializeApp/cert from 'firebase-admin/app' and
// getAuth from 'firebase-admin/auth'. Returns the Auth instance (or null
// when no key file is configured).
let fbAuth = null;
async function getFbAdmin() {
  if (fbAuth) return fbAuth;
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  let svc = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Hosted deploys (Render etc.): the whole key JSON pasted as an env var.
    svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : path.resolve('serviceAccountKey.json');
    if (!fs.existsSync(keyPath)) return null;
    svc = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  }
  if (!getApps().length) initializeApp({ credential: cert(svc) });
  fbAuth = getAuth();
  return fbAuth;
}

function makeOtp() {
  // Demo mode: fixed code so the frontend can show it. Production: random + SMS gateway.
  return DEMO_MODE ? '123456' : String(Math.floor(100000 + Math.random() * 900000));
}

// POST /api/auth/otp/request  { phone }
router.post('/otp/request', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!/^[6-9]\d{9}$/.test(String(phone || '').trim())) {
      return res.status(400).json({ ok: false, error: 'Enter a valid 10-digit mobile number.' });
    }
    const clean = String(phone).trim();
    await Otp.deleteMany({ phone: clean });
    const code = makeOtp();
    await Otp.create({ phone: clean, code });

    // TODO (production): send `code` via MSG91 / Twilio / Firebase here.
    if (!DEMO_MODE) console.log(`[otp] ${clean} -> ${code}`);

    const user = await User.findOne({ phone: clean });
    res.json({ ok: true, exists: !!user, demoCode: DEMO_MODE ? code : undefined });
  } catch (err) { next(err); }
});

// POST /api/auth/otp/verify  { phone, code, name?, role?, profession? }
router.post('/otp/verify', async (req, res, next) => {
  try {
    const { phone, code, name, role, profession } = req.body;
    const clean = String(phone || '').trim();
    const rec = await Otp.findOne({ phone: clean, code: String(code || '').trim() });
    if (!rec) return res.status(400).json({ ok: false, error: 'Incorrect or expired OTP.' });
    await Otp.deleteMany({ phone: clean });

    let user = await User.findOne({ phone: clean });
    if (!user) {
      if (!name || String(name).trim().length < 2) {
        return res.status(404).json({ ok: false, error: 'No account found for this number. Please register first.' });
      }
      user = await User.create({
        name: String(name).trim(),
        phone: clean,
        role: role === 'professional' ? 'professional' : 'customer',
        profession: String(profession || '').trim(),
      });
    }
    const token = signToken(user);
    res.json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, profession: user.profession },
    });
  } catch (err) { next(err); }
});

// GET /api/auth/me  (protected)
router.get('/me', requireAuth, (req, res) => {
  const u = req.user;
  res.json({ ok: true, user: { id: u._id, name: u.name, phone: u.phone, role: u.role, profession: u.profession } });
});

// POST /api/auth/firebase  { idToken, name?, role?, profession? }
// The frontend already verified the SMS OTP with Firebase Phone Auth.
// We verify the ID token server-side, then find-or-create the user and
// return our own JWT (same session format as the OTP flow).
router.post('/firebase', async (req, res, next) => {
  try {
    const admin = await getFbAdmin();
    if (!admin) {
      return res.status(501).json({
        ok: false,
        error: 'Firebase Admin is not configured on the server. Add serviceAccountKey.json (see backend README).',
      });
    }
    const { idToken, name, role, profession } = req.body;
    if (!idToken) return res.status(400).json({ ok: false, error: 'Missing ID token.' });

    let decoded;
    try {
      decoded = await admin.verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ ok: false, error: 'OTP verification failed. Please try again.' });
    }
    const phone = String(decoded.phone_number || '').replace(/^\+91/, '');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ ok: false, error: 'Phone number was not verified by Firebase.' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      if (!name || String(name).trim().length < 2) {
        return res.status(404).json({ ok: false, error: 'No account found for this number. Please register first.' });
      }
      user = await User.create({
        name: String(name).trim(),
        phone,
        role: role === 'professional' ? 'professional' : 'customer',
        profession: String(profession || '').trim(),
      });
    }
    const token = signToken(user);
    res.json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, profession: user.profession },
    });
  } catch (err) { next(err); }
});

export default router;
