import React from 'react';
import { services } from '../data/services.js';
import './PricePanel.css';

// Prices come straight from services.js — the same numbers the booking
// flow charges. Nothing here is invented: no "starting at", no extra
// visit fee, no hidden charges.
const promises = [
  { title: 'Jo dikhta hai, wahi final', text: 'Card pe jo price hai, wahi aap pay karte ho — na "starting at", na baad me extra.' },
  { title: 'No hidden charges', text: 'Visit, inspection aur service — sab price me included. Alag se koi fee nahi.' },
  { title: 'Pay after the job', text: 'Kaam poora hone ke baad hi pay karo. Khush nahi ho to free re-service ya refund.' },
];

export default function PricePanel({ onSelectService }) {
  return (
    <section className="section price-panel" id="pricing">
      <div className="container">
        <div className="center">
          <h2 className="section-title">One price. No surprises.</h2>
          <p className="section-sub">Har service ka ek fixed price — jo dikhta hai, wahi final hai.</p>
        </div>

        <div className="price-grid">
          <div className="price-promises">
            {promises.map((p) => (
              <div key={p.title} className="promise-card">
                <span className="promise-tick">✓</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="price-list">
            {services.map((s) => (
              <div key={s.id} className="price-row">
                <span className="price-row-main">
                  <strong>{s.name}</strong>
                  <span>{s.tagline}</span>
                </span>
                <span className="price-row-price">₹{s.price}<em> / {s.unit}</em></span>
                <button className="btn btn-primary price-book" onClick={() => onSelectService(s)}>Book</button>
              </div>
            ))}
            <p className="price-note">Prices include the pro's visit — no extra charges at any step.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
