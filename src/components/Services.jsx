import React from 'react';
import ServiceIcon from './ServiceIcon.jsx';
import { services } from '../data/services.js';
import './Services.css';

export default function Services({ onSelectService }) {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="center">
          <h2 className="section-title">Every fix your home needs</h2>
          <p className="section-sub">Upfront pricing, verified professionals, and a service guarantee on every job.</p>
        </div>
        <div className="services-grid">
          {services.map((s) => (
            <article key={s.id} className="service-card">
              <span className="service-icon"><ServiceIcon name={s.icon} size={30} /></span>
              <h3>{s.name}</h3>
              <p className="service-tag">{s.tagline}</p>
              <div className="service-meta">
                <span className="rating">★ {s.rating}</span>
                <span className="jobs">{s.jobs} jobs</span>
              </div>
              <div className="service-foot">
                <span className="price">₹{s.price}<em> / {s.unit}</em></span>
                <button className="btn btn-primary btn-sm" onClick={() => onSelectService(s)}>Book</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
