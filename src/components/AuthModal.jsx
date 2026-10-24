import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { sendOtp, verifyOtp, registerUser, loginWithPhone, firebaseLogin, DEMO_OTP } from '../api/client.js';
import { isFirebaseConfigured, sendFirebaseOtp, verifyFirebaseOtp } from '../api/firebase.js';
import './AuthModal.css';

// Real SMS OTP via Firebase when configured AND the real backend is in use.
// Otherwise falls back to the built-in demo OTP flow.
const USE_FIREBASE = isFirebaseConfigured() && !!import.meta.env.VITE_API_URL;

// Props: open, initialMode ('login' | 'register'), initialRole ('customer' | 'professional'), onClose
export default function AuthModal({ open, initialMode = 'login', initialRole = 'customer', onClose }) {
  const { login } = useAuth();
  const [mode, setMode] = useState(initialMode);       // login | register | otp | done
  const [role, setRole] = useState(initialRole);       // customer | professional
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profession, setProfession] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingUser, setPendingUser] = useState(null); // holds register payload between steps
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [demoCode, setDemoCode] = useState('');

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setRole(initialRole);
      setName(''); setPhone(''); setProfession(''); setOtp('');
      setPendingUser(null); setError(''); setDemoCode(''); setBusy(false);
    }
  }, [open, initialMode, initialRole]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const validPhone = /^[6-9]\d{9}$/.test(phone.trim());

  const handleSendOtp = async () => {
    setError('');
    if (mode === 'register' && name.trim().length < 2) { setError('Please enter your full name.'); return; }
    if (!validPhone) { setError('Enter a valid 10-digit mobile number.'); return; }
    if (mode === 'register' && role === 'professional' && !profession.trim()) {
      setError('Please enter your profession / skill.'); return;
    }
    setBusy(true);
    try {
      if (mode === 'register') {
        setPendingUser({
          name: name.trim(), phone: phone.trim(), role,
          extra: role === 'professional' ? { profession: profession.trim() } : {},
        });
      }
      if (USE_FIREBASE) {
        // Real SMS via Firebase (uses the test number + fixed code in dev).
        await sendFirebaseOtp(phone.trim());
        setDemoCode('');
        setMode('otp');
        return;
      }
      const res = await sendOtp(phone.trim());
      if (!res.ok) { setError(res.error || 'Could not send OTP.'); setBusy(false); return; }
      if (mode === 'login' && res.exists === false) {
        setError('No account found for this number. Please register first.');
        setBusy(false);
        return;
      }
      setDemoCode(res.demoCode);
      setMode('otp');
    } catch (e) {
      setError(e.message || 'Could not send OTP. Please try again.');
    } finally { setBusy(false); }
  };

  const handleVerify = async () => {
    setError('');
    if (otp.trim().length !== 6) { setError('Enter the 6-digit OTP.'); return; }
    setBusy(true);
    try {
      if (USE_FIREBASE) {
        // Firebase verified the SMS; hand its ID token to our backend.
        const fb = await verifyFirebaseOtp(otp.trim());
        const r = await firebaseLogin(fb.idToken, pendingUser);
        if (!r.ok) { setError(r.error || 'Login failed. Please try again.'); setBusy(false); return; }
        login(r.user);
        setMode('done');
        return;
      }
      // Real backend: verifies OTP and registers/logs in in one call.
      // Mock mode: verifies only, then the modal completes registration/login below.
      const v = await verifyOtp(phone.trim(), otp.trim(), pendingUser);
      if (!v.ok) { setError(v.error); setBusy(false); return; }
      let user = v.user;
      if (!user) {
        if (pendingUser) {
          const r = await registerUser(pendingUser);
          if (!r.ok) { setError(r.error); setBusy(false); return; }
          user = r.user;
        } else {
          const r = await loginWithPhone(phone.trim());
          if (!r.ok) { setError(r.error); setBusy(false); return; }
          user = r.user;
        }
      }
      login(user);
      setMode('done');
    } catch (e) {
      // Without this catch, any Firebase/backend failure during verify was
      // swallowed silently — the button just reset with no message at all.
      setError(e.message || 'Could not verify the OTP. Please try again.');
    } finally { setBusy(false); }
  };

  const switchMode = (m) => { setMode(m); setError(''); setOtp(''); setDemoCode(''); };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">✕</button>
        {/* reCAPTCHA mount: always rendered while modal is open, so Firebase
            phone auth can attach its invisible verifier on Send OTP. */}
        <div id="recaptcha-container"></div>

        {mode === 'done' ? (
          <div className="auth-done">
            <span className="done-tick">✓</span>
            <h2>Welcome{role === 'professional' && pendingUser ? ', Pro' : ''}!</h2>
            <p>You are logged in successfully.</p>
            <button className="btn btn-primary btn-block" onClick={onClose}>Continue</button>
          </div>
        ) : mode === 'otp' ? (
          <>
            <h2>Verify OTP</h2>
            <p className="modal-sub">Sent to +91 {phone}</p>
            <label className="field">
              <span>6-digit OTP</span>
              <input
                className="otp-input" placeholder="••••••" maxLength={6}
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </label>
            {demoCode && <p className="demo-hint">Demo OTP: <strong>{demoCode}</strong> (dev only)</p>}
            {USE_FIREBASE && !demoCode && (
              <p className="demo-hint">Real SMS sent via Firebase. Test numbers use the code set in the Firebase console.</p>
            )}
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary btn-block" disabled={busy} onClick={handleVerify}>
              {busy ? 'Verifying…' : 'Verify & Continue'}
            </button>
            <button className="link-btn center-btn" disabled={busy} onClick={handleSendOtp}>Resend OTP</button>
          </>
        ) : (
          <>
            <h2>{mode === 'login' ? 'Login to FixMate' : 'Create your account'}</h2>
            <p className="modal-sub">
              {mode === 'login' ? 'Enter your mobile number to continue.' : 'Join as a customer or a professional.'}
            </p>

            {mode === 'register' && (
              <div className="role-toggle">
                <button className={role === 'customer' ? 'active' : ''} onClick={() => setRole('customer')}>
                  Customer
                </button>
                <button className={role === 'professional' ? 'active' : ''} onClick={() => setRole('professional')}>
                  Professional
                </button>
              </div>
            )}

            {mode === 'register' && (
              <label className="field">
                <span>Full name</span>
                <input placeholder="e.g. Ansh Chhipne" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
            )}

            <label className="field">
              <span>Mobile number</span>
              <div className="phone-row">
                <span className="cc">+91</span>
                <input
                  placeholder="10-digit mobile number" maxLength={10}
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </label>

            {mode === 'register' && role === 'professional' && (
              <label className="field">
                <span>Profession / skill</span>
                <input placeholder="e.g. Electrician, Plumber" value={profession} onChange={(e) => setProfession(e.target.value)} />
              </label>
            )}

            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary btn-block" disabled={busy} onClick={handleSendOtp}>
              {busy ? 'Sending…' : 'Send OTP'}
            </button>

            <p className="swap">
              {mode === 'login' ? (
                <>New here? <button className="link-btn" onClick={() => switchMode('register')}>Create account</button></>
              ) : (
                <>Already registered? <button className="link-btn" onClick={() => switchMode('login')}>Login</button></>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
