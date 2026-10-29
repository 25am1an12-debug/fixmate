import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getBookings, updateBooking } from '../api/client.js';
import './ProDashboard.css';

// Pro Dashboard — where a professional sees bookings and confirms them.
// New bookings: confirmed bookings no pro has taken yet.
// My jobs: bookings this pro accepted. Accept -> in_progress (the
// customer's timeline moves), Job done -> completed (customer can then
// pay and rate). All rules are enforced again by the backend/mock API.

const STATUS_LABEL = {
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function formatDate(dateISO) {
  const d = new Date(dateISO);
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

function JobCard({ booking, mine, busy, onAccept, onDone }) {
  return (
    <div className="pro-card">
      <div className="pro-card-head">
        <div>
          <h4>{booking.serviceName}</h4>
          <p className="pro-card-id">{booking.id}</p>
        </div>
        <span className={`pro-chip st-${booking.status}`}>{STATUS_LABEL[booking.status] || booking.status}</span>
      </div>

      <div className="pro-grid">
        <div><span>Service</span><strong>{booking.variant}</strong></div>
        <div><span>Date</span><strong>{formatDate(booking.dateISO)}</strong></div>
        <div><span>Time slot</span><strong>{booking.slot}</strong></div>
        <div><span>Amount</span><strong>{inr(booking.amount)}</strong></div>
      </div>

      <p className="pro-customer">
        Customer: <strong>{booking.customerName || 'Customer'}</strong>
        {booking.customerPhone ? ` • ${booking.customerPhone}` : ''}
      </p>
      <p className="pro-address">{booking.address}</p>
      {booking.location && booking.location.lat != null && booking.location.lng != null && (
        <p className="pro-location">
          📍 <a href={`https://www.google.com/maps?q=${booking.location.lat},${booking.location.lng}`} target="_blank" rel="noreferrer">Open in Maps</a> — customer ki location
        </p>
      )}

      {booking.status === 'completed' && (
        <p className="pro-done-note">
          {booking.paymentStatus === 'paid' ? `✓ Payment received — ${inr(booking.amount)}` : 'Job done — payment pending from customer'}
          {booking.rating ? ` • Rated ${starsText(booking.rating)}` : ''}
        </p>
      )}

      {!mine && booking.status === 'confirmed' && (
        <div className="pro-actions">
          <button className="btn btn-primary" onClick={() => onAccept(booking)} disabled={!!busy}>
            {busy === `accept-${booking.id}` ? 'Accepting…' : 'Accept booking'}
          </button>
        </div>
      )}
      {mine && booking.status === 'in_progress' && (
        <div className="pro-actions">
          <button className="btn btn-primary" onClick={() => onDone(booking)} disabled={!!busy}>
            {busy === `done-${booking.id}` ? 'Saving…' : '✓ Job done'}
          </button>
          <span className="pro-action-note">Kaam khatam ho jaye to dabao — customer ko Pay aur Rating khul jayega.</span>
        </div>
      )}
    </div>
  );
}

export default function ProDashboard({ onBack, onLogin }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    const r = await getBookings(user.id);
    if (r.ok) setBookings(r.bookings);
    else setError(r.error || 'Bookings load nahi ho payi.');
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) {
    return (
      <section className="section pro-page">
        <div className="container">
          <button className="link-btn track-back" onClick={onBack}>← Back to home</button>
          <div className="pro-card pro-login">
            <h3>Professional login required</h3>
            <p>Bookings dekhne aur accept karne ke liye pehle professional account se login karo.</p>
            <button className="btn btn-primary" onClick={onLogin}>Professional Login</button>
          </div>
        </div>
      </section>
    );
  }

  if (user.role !== 'professional') {
    return (
      <section className="section pro-page">
        <div className="container">
          <button className="link-btn track-back" onClick={onBack}>← Back to home</button>
          <div className="pro-card pro-login">
            <h3>Ye page sirf professionals ke liye hai</h3>
            <p>Tum customer account se logged in ho. Professional dashboard ke liye professional account se login karo — tumhari bookings My Bookings me hain.</p>
          </div>
        </div>
      </section>
    );
  }

  const mine = (bookings || []).filter((b) => b.proId && String(b.proId) === String(user.id));
  const fresh = (bookings || []).filter((b) => !b.proId && b.status === 'confirmed');

  const run = async (booking, action) => {
    setBusy(`${action === 'accept' ? 'accept' : 'done'}-${booking.id}`);
    setError('');
    const r = await updateBooking(booking.id, {
      action,
      proId: user.id, proName: user.name, proPhone: user.phone,
    });
    setBusy(null);
    if (!r.ok) { setError(r.error || 'Something went wrong.'); return; }
    load();
  };

  return (
    <section className="section pro-page">
      <div className="container">
        <button className="link-btn track-back" onClick={onBack}>← Back to home</button>
        <div className="center">
          <h2 className="section-title">Pro Dashboard</h2>
          <p className="section-sub">
            Namaste {user.name}{user.profession ? ` • ${user.profession}` : ''} — nayi bookings accept karo aur apne jobs yahin manage karo.
          </p>
        </div>

        {error && <p className="pro-error">{error}</p>}
        {bookings === null ? (
          <p className="pro-loading">Bookings load ho rahi hain…</p>
        ) : (
          <>
            <h3 className="pro-section-title">My jobs ({mine.length})</h3>
            {mine.length === 0 ? (
              <p className="pro-empty">Abhi koi job accept nahi kiya hai. Neeche nayi bookings se koi job accept karo.</p>
            ) : (
              <div className="pro-list">
                {mine.map((b) => (
                  <JobCard key={b.id} booking={b} mine busy={busy}
                    onAccept={(bk) => run(bk, 'accept')} onDone={(bk) => run(bk, 'pro_complete')} />
                ))}
              </div>
            )}

            <h3 className="pro-section-title">New bookings ({fresh.length})</h3>
            {fresh.length === 0 ? (
              <p className="pro-empty">Abhi koi nayi booking nahi hai. Nayi booking aate hi yahan dikhegi.</p>
            ) : (
              <div className="pro-list">
                {fresh.map((b) => (
                  <JobCard key={b.id} booking={b} mine={false} busy={busy}
                    onAccept={(bk) => run(bk, 'accept')} onDone={(bk) => run(bk, 'pro_complete')} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
