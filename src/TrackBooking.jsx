import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getBookings } from '../api/client.js';
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

function BookingDetail({ booking, onBack }) {
  const cancelled = booking.status === 'cancelled';
  const current = CURRENT_STEP[booking.status] ?? 0;
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
          <BookingDetail booking={selected} onBack={() => setSelected(null)} />
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
