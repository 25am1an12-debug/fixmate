import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getBookings, updateBooking } from '../api/client.js';
import { timeSlots, nextDays } from '../data/services.js';
import './TrackBooking.css';

// Live timeline — driven only by the booking's real status.
// No pro names or ETAs are invented: future steps stay "upcoming" until
// the status actually moves.
const STEPS = ['Requested', 'Pro assigned', 'Pro on the way', 'Job done', 'Payment'];

// status -> index of the step currently in progress
const CURRENT_STEP = { confirmed: 1, in_progress: 3, completed: 4 };

const STATUS_LABEL = {
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function formatDate(dateISO) {
  const d = new Date(`${dateISO}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateISO;
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function inr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function starsText(rating) {
  const r = Math.round(Number(rating) || 0);
  return '★'.repeat(r) + '☆'.repeat(Math.max(0, 5 - r));
}

function BookingDetail({ booking, onBack, onUpdated }) {
  const cancelled = booking.status === 'cancelled';
  const done = booking.status === 'completed';
  const paid = booking.paymentStatus === 'paid';
  // All 5 steps done once payment is marked paid; otherwise the step
  // from the status is the one in progress.
  const current = paid ? STEPS.length : (CURRENT_STEP[booking.status] ?? 0);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmPay, setConfirmPay] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [resDayIdx, setResDayIdx] = useState(0);
  const [resSlot, setResSlot] = useState('');
  const resDays = nextDays(7);
  const fmtDay = (d) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const [busy, setBusy] = useState(null);
  const [actionError, setActionError] = useState('');

  const run = async (action, extra = {}) => {
    setBusy(action);
    setActionError('');
    const r = await updateBooking(booking.id, { action, ...extra });
    setBusy(null);
    if (!r.ok) { setActionError(r.error || 'Something went wrong.'); return; }
    setConfirmCancel(false);
    setConfirmPay(false);
    setShowReschedule(false);
    onUpdated(r.booking);
  };

  return (
    <div>
      <button className="link-btn track-back" onClick={onBack}>← All bookings</button>
      <div className="track-card track-detail">
        <div className="track-detail-head">
          <div>
            <h3>{booking.serviceName}</h3>
            <p className="track-detail-id">{booking.id}</p>
          </div>
          <span className={`status-chip st-${booking.status}`}>{STATUS_LABEL[booking.status] || booking.status}</span>
        </div>

        <div className="track-detail-grid">
          <div><span>Service</span><strong>{booking.variant}</strong></div>
          <div><span>Date</span><strong>{formatDate(booking.dateISO)}</strong></div>
          <div><span>Time slot</span><strong>{booking.slot}</strong></div>
          <div><span>Amount</span><strong>{inr(booking.amount)}</strong></div>
        </div>
        <p className="track-address">{booking.address}</p>
        {booking.location && booking.location.lat != null && booking.location.lng != null && (
          <p className="track-location">
            📍 Location saved — <a href={`https://www.google.com/maps?q=${booking.location.lat},${booking.location.lng}`} target="_blank" rel="noreferrer">Open in Maps</a> · pro yahin se navigate karke aayega.
          </p>
        )}

        {cancelled ? (
          <p className="track-cancelled">Ye booking cancelled hai.</p>
        ) : (
          <>
            <div className="timeline">
              {STEPS.map((label, i) => (
                <div key={label} className={`tl-step${i < current ? ' done' : i === current ? ' active' : ''}`}>
                  <span className="tl-dot">{i < current ? '✓' : i + 1}</span>
                  <span className="tl-label">{label}</span>
                  {i === current && <span className="tl-now">In progress</span>}
                </div>
              ))}
            </div>
            <p className="track-note">Pro assign hote hi uska naam aur ETA yahin dikhega. Fixed visit fee, no hidden charges — pay only after the job is done.</p>

            {/* Confirmed: cancel, reschedule, or confirm the job is done */}
            {!done && (
              <div className="track-actions">
                <button className="btn btn-danger-outline" onClick={() => setConfirmCancel(true)} disabled={!!busy}>Cancel booking</button>
                {booking.status === 'confirmed' && (
                  <button
                    className="btn"
                    onClick={() => { setShowReschedule(true); setResSlot(booking.slot); }}
                    disabled={!!busy}
                  >
                    Reschedule
                  </button>
                )}
                <button className="btn btn-primary" onClick={() => run('complete')} disabled={!!busy}>
                  {busy === 'complete' ? 'Saving…' : '✓ Job done — mark complete'}
                </button>
              </div>
            )}
            {!done && (
              <p className="track-action-note">Kaam poora ho gaya ho to "Job done" dabao — uske baad Pay aur Rating khul jayenge.</p>
            )}
            {!done && booking.status === 'confirmed' && showReschedule && (
              <div className="reschedule-box">
                <h4>Reschedule booking</h4>
                <p>Pick a new date and time — no extra charge, no need to cancel.</p>
                <p className="pick-label">Choose a day</p>
                <div className="reschedule-days">
                  {resDays.map((d, i) => (
                    <button key={i} type="button" className={i === resDayIdx ? 'active' : ''} onClick={() => setResDayIdx(i)}>
                      {fmtDay(d)}
                    </button>
                  ))}
                </div>
                <p className="pick-label">Choose a time</p>
                <div className="reschedule-slots">
                  {timeSlots.map((t) => (
                    <button key={t} type="button" className={t === resSlot ? 'active' : ''} onClick={() => setResSlot(t)}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="reschedule-row">
                  <button
                    className="btn btn-primary"
                    onClick={() => run('reschedule', { dateISO: resDays[resDayIdx].toISOString(), slot: resSlot })}
                    disabled={!resSlot || !!busy}
                  >
                    {busy === 'reschedule' ? 'Saving…' : 'Save new date & time'}
                  </button>
                  <button className="btn" onClick={() => setShowReschedule(false)} disabled={!!busy}>Keep old slot</button>
                </div>
              </div>
            )}
            {confirmCancel && !done && (
              <div className="track-confirm">
                <p>Pakka cancel karna hai? Ye booking cancelled ho jayegi.</p>
                <div className="track-confirm-row">
                  <button className="btn btn-danger-outline" onClick={() => run('cancel')} disabled={!!busy}>
                    {busy === 'cancel' ? 'Cancelling…' : 'Yes, cancel booking'}
                  </button>
                  <button className="btn" onClick={() => setConfirmCancel(false)} disabled={!!busy}>No, keep it</button>
                </div>
              </div>
            )}

            {/* Completed: pay after the job, then rate the pro */}
            {done && (
              <div className="track-actions">
                {paid ? (
                  <span className="paid-badge">✓ Paid {inr(booking.amount)}</span>
                ) : (
                  <button className="btn btn-primary" onClick={() => setConfirmPay(true)} disabled={!!busy}>
                    Pay {inr(booking.amount)}
                  </button>
                )}
              </div>
            )}
            {done && !paid && (
              <p className="track-action-note">Pay the pro directly by cash or UPI, then tap Pay to mark this booking as paid.</p>
            )}
            {done && !paid && confirmPay && (
              <div className="track-confirm track-confirm-pay">
                <p>{inr(booking.amount)} pro ko de diye? Confirm karte hi booking Paid mark ho jayegi.</p>
                <div className="track-confirm-row">
                  <button className="btn btn-primary" onClick={() => run('pay')} disabled={!!busy}>
                    {busy === 'pay' ? 'Saving…' : 'Yes, mark as paid'}
                  </button>
                  <button className="btn" onClick={() => setConfirmPay(false)} disabled={!!busy}>Not yet</button>
                </div>
              </div>
            )}
            {done && (
              booking.rating ? (
                <div className="rated-box">
                  <h4>You rated this service</h4>
                  <span className="rated-stars">{starsText(booking.rating)}</span>
                  {booking.review && <p>"{booking.review}"</p>}
                </div>
              ) : (
                <div className="rate-box">
                  <h4>Rate your pro</h4>
                  <p>Kaam kaisa laga? Stars dabao — 5 matlab best.</p>
                  <div className="rate-stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" className={n <= stars ? 'on' : ''} onClick={() => setStars(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>★</button>
                    ))}
                  </div>
                  <textarea
                    placeholder="How was the service? (optional)"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    maxLength={500}
                  />
                  <button
                    className="btn btn-primary rate-submit"
                    onClick={() => run('rate', { rating: stars, review: review.trim() })}
                    disabled={stars === 0 || !!busy}
                  >
                    {busy === 'rate' ? 'Saving…' : 'Submit rating'}
                  </button>
                </div>
              )
            )}

            {actionError && <p className="track-action-error">{actionError}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default function TrackBooking({ onBack, onLogin, onBookNow }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    setLoading(true);
    setLoadError('');
    getBookings(user.id)
      .then((r) => {
        if (!alive) return;
        if (!r.ok) { setLoadError(r.error || 'Could not load your bookings.'); return; }
        setBookings(r.bookings || []);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user]);

  const handleUpdated = (updated) => {
    setBookings((list) => list.map((b) => (b.id === updated.id ? updated : b)));
    setSelected(updated);
  };

  const trackById = () => {
    const q = query.trim().toUpperCase();
    if (!q) { setQueryError('Enter your Booking ID (e.g. BK_...).'); return; }
    const found = bookings.find((b) => String(b.id || '').toUpperCase() === q);
    if (!found) {
      setSelected(null);
      setQueryError('Is Booking ID ki booking aapke account me nahi mili. ID dobara check karo.');
      return;
    }
    setQueryError('');
    setSelected(found);
  };

  return (
    <section className="section track-page">
      <div className="container">
        <button className="link-btn track-back" onClick={onBack}>← Back to home</button>
        <div className="center">
          <h2 className="section-title">My Bookings</h2>
          <p className="section-sub">Track every booking live — from request to payment.</p>
        </div>

        {!user ? (
          <div className="track-card track-login">
            <h3>Login to see your bookings</h3>
            <p>Apni bookings aur unka live status dekhne ke liye login karo.</p>
            <button className="btn btn-primary" onClick={onLogin}>Login</button>
          </div>
        ) : selected ? (
          <BookingDetail booking={selected} onBack={() => setSelected(null)} onUpdated={handleUpdated} />
        ) : (
          <>
            <div className="track-card track-search">
              <label className="track-label">
                <span>Track by Booking ID</span>
                <div className="track-search-row">
                  <input
                    placeholder="e.g. BK_MVL9GSXE40GT"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') trackById(); }}
                  />
                  <button className="btn btn-primary" onClick={trackById}>Track</button>
                </div>
              </label>
              {queryError && <p className="form-error">{queryError}</p>}
            </div>

            {loading ? (
              <p className="track-loading">Loading your bookings…</p>
            ) : loadError ? (
              <p className="form-error">{loadError}</p>
            ) : bookings.length === 0 ? (
              <div className="track-card track-empty">
                <h3>No bookings yet</h3>
                <p>Abhi tak koi booking nahi hai. Pehli booking karo — status yahin live dikhega.</p>
                <button className="btn btn-primary" onClick={onBookNow}>Book a service</button>
              </div>
            ) : (
              <div className="track-list">
                {bookings.map((b) => (
                  <button key={b.id} className="track-item" onClick={() => setSelected(b)}>
                    <span className="track-item-main">
                      <strong>{b.serviceName}</strong>
                      <span>{b.variant} • {formatDate(b.dateISO)} • {b.slot}</span>
                      <span className="track-item-id">{b.id}</span>
                    </span>
                    <span className="track-item-side">
                      <span className={`status-chip st-${b.status}`}>{STATUS_LABEL[b.status] || b.status}</span>
                      <strong>{inr(b.amount)}</strong>
                      <span className="track-item-go">Track →</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
