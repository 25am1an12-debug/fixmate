import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { createBooking } from '../api/client.js';
import { timeSlots, nextDays } from '../data/services.js';
import ServiceIcon from './ServiceIcon.jsx';
import './BookingModal.css';

// Props: open, service, onClose, onRequireLogin
export default function BookingModal({ open, service, onClose, onRequireLogin }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [variant, setVariant] = useState('');
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState('');
  const [address, setAddress] = useState('');
  // GPS location from the customer's phone — free browser geolocation,
  // reverse-geocoded with OpenStreetMap Nominatim (free, no API key).
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('idle');
  const [locError, setLocError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  if (!open || !service) return null;
  const days = nextDays(7);

  const reset = () => {
    setStep(1); setVariant(''); setDayIdx(0); setSlot('');
    setAddress(''); setError(''); setConfirmed(null); setBusy(false);
    setLocation(null); setLocStatus('idle'); setLocError('');
  };
  const close = () => { reset(); onClose(); };

  const canNext1 = !!variant;
  const canNext2 = !!slot;
  const canNext3 = address.trim().length >= 10;

  // "Use my current location" — browser GPS (free), then Nominatim turns
  // the coordinates into a readable address. The coordinates are saved
  // with the booking so the pro can open Maps and navigate straight there.
  const handleUseLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocError('Is device/browser me location supported nahi hai. Address haath se likho.');
      return;
    }
    setLocStatus('locating');
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          if (data && data.display_name) setAddress(data.display_name);
          setLocStatus('done');
        } catch {
          // Address nahi mila to bhi location save hai — pro Maps se pahunch jayega.
          setLocStatus('done');
        }
      },
      (err) => {
        setLocStatus('idle');
        setLocError(
          err.code === 1
            ? 'Location permission denied hai — browser ke address bar me location Allow karo, ya address haath se likho.'
            : 'Location nahi mil payi. Address haath se likho.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = async () => {
    if (!user) { onRequireLogin(); return; }
    setBusy(true); setError('');
    try {
      const res = await createBooking({
        userId: user.id,
        serviceId: service.id,
        variant,
        dateISO: days[dayIdx].toISOString(),
        slot,
        address: address.trim(),
        location,
      });
      // createBooking returns { ok:false, error } on failure instead of
      // throwing (e.g. backend down or session expired). Jumping to the
      // success step without a booking left the modal blank/stuck, so
      // stay on Review and show the error instead.
      if (!res.ok || !res.booking) {
        setError(res.error || 'Booking failed. Please try again.');
        return;
      }
      setConfirmed(res.booking);
      setStep(5);
    } catch (e) {
      setError('Booking failed. Please try again.');
    } finally { setBusy(false); }
  };

  const fmtDay = (d) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={close} aria-label="Close">✕</button>

        {step === 5 && confirmed ? (
          <div className="auth-done">
            <span className="done-tick">✓</span>
            <h2>Booking confirmed!</h2>
            <p>Your pro will arrive on <strong>{fmtDay(new Date(confirmed.dateISO))}</strong> at <strong>{confirmed.slot}</strong>.</p>
            <div className="booking-id">Booking ID: <strong>{confirmed.id}</strong></div>
            <button className="btn btn-primary btn-block" onClick={close}>Done</button>
          </div>
        ) : (
          <>
            <div className="book-head">
              <span className="service-icon sm"><ServiceIcon name={service.icon} size={24} /></span>
              <div>
                <h2>Book {service.name}</h2>
                <p className="modal-sub">₹{service.price} / {service.unit} · ★ {service.rating}</p>
              </div>
            </div>

            <div className="steps-bar">
              {['Service', 'Slot', 'Address', 'Review'].map((l, i) => (
                <span key={l} className={`sbit ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'now' : ''}`}>
                  {i + 1}. {l}
                </span>
              ))}
            </div>

            {step === 1 && (
              <div className="variants">
                {service.variants.map((v) => (
                  <button key={v} className={`variant ${variant === v ? 'active' : ''}`} onClick={() => setVariant(v)}>
                    {v}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <>
                <p className="pick-label">Choose a day</p>
                <div className="days">
                  {days.map((d, i) => (
                    <button key={i} className={`day ${dayIdx === i ? 'active' : ''}`} onClick={() => setDayIdx(i)}>
                      {fmtDay(d)}
                    </button>
                  ))}
                </div>
                <p className="pick-label">Choose a time</p>
                <div className="slots">
                  {timeSlots.map((t) => (
                    <button key={t} className={`slot ${slot === t ? 'active' : ''}`} onClick={() => setSlot(t)}>
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <button type="button" className="btn loc-btn" onClick={handleUseLocation} disabled={locStatus === 'locating'}>
                  {locStatus === 'locating' ? 'Locating…' : '📍 Use my current location'}
                </button>
                {locStatus === 'done' && <p className="loc-status loc-ok">✓ Location saved — pro can navigate to your home from My Bookings.</p>}
                {locError && <p className="loc-status loc-err">{locError}</p>}
                <label className="field">
                  <span>Service address</span>
                  <textarea
                    rows={4} placeholder="Flat / house no., street, landmark, city, PIN"
                    value={address} onChange={(e) => setAddress(e.target.value)}
                  />
                </label>
              </>
            )}

            {step === 4 && (
              <div className="review-box">
                <div><span>Service</span><strong>{service.name} — {variant}</strong></div>
                <div><span>When</span><strong>{fmtDay(days[dayIdx])}, {slot}</strong></div>
                <div><span>Where</span><strong>{address}</strong></div>
                <div><span>Amount</span><strong className="amt">₹{service.price}</strong></div>
                {!user && <p className="demo-hint">You'll be asked to login before confirming.</p>}
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <div className="book-nav">
              {step > 1 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
              {step < 4 && (
                <button
                  className="btn btn-primary" style={{ marginLeft: 'auto' }}
                  disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2) || (step === 3 && !canNext3)}
                  onClick={() => setStep(step + 1)}
                >
                  Continue
                </button>
              )}
              {step === 4 && (
                <button className="btn btn-primary" style={{ marginLeft: 'auto' }} disabled={busy} onClick={handleConfirm}>
                  {busy ? 'Confirming…' : `Confirm · ₹${service.price}`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
