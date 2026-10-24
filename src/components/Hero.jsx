import React, { useState } from 'react';
import ServiceIcon from './ServiceIcon.jsx';
import { services } from '../data/services.js';
import './Hero.css';

const quick = services.slice(0, 6);

export default function Hero({ onSelectService }) {
  const [q, setQ] = useState('');
  const results = q.trim()
    ? services.filter((s) => (s.name + ' ' + s.tagline).toLowerCase().includes(q.toLowerCase()))
    : [];

  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="pill">Trusted by 50,000+ households</span>
          <h1>Home services,<br /><span className="accent">fixed right.</span></h1>
          <p className="hero-sub">
            Verified professionals for plumbing, electrical, cleaning and more —
            at your doorstep, on your schedule, with upfront pricing.
          </p>

          <div className="search-wrap">
            <input
              className="search-input"
              placeholder='Try "plumbing", "AC repair", "cleaning"…'
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {results.length > 0 && (
              <div className="search-results">
                {results.map((s) => (
                  <button key={s.id} onClick={() => { onSelectService(s); setQ(''); }}>
                    <ServiceIcon name={s.icon} size={20} />
                    <span>{s.name}</span>
                    <em>₹{s.price} {s.unit}</em>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hero-stats">
            <div><strong>4.8★</strong><span>Avg. rating</span></div>
            <div><strong>95k+</strong><span>Jobs done</span></div>
            <div><strong>45 min</strong><span>Avg. response</span></div>
          </div>
        </div>

        <div className="hero-cards">
          {quick.map((s) => (
            <button key={s.id} className="quick-card" onClick={() => onSelectService(s)}>
              <span className="quick-icon"><ServiceIcon name={s.icon} size={26} /></span>
              <span className="quick-name">{s.name}</span>
              <span className="quick-price">from ₹{s.price}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
