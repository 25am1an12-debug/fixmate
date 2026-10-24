import React from 'react';
import './ProCta.css';

export default function ProCta({ onJoinAsPro, onProLogin }) {
  return (
    <section className="section pro" id="pro">
      <div className="container pro-inner">
        <div>
          <h2 className="section-title light">Are you a skilled professional?</h2>
          <p className="pro-sub">
            Join 2,000+ FixMate pros. Get steady jobs near you, zero commission
            for your first month, and weekly payouts.
          </p>
          <ul className="pro-points">
            <li>Free onboarding & background verification</li>
            <li>Choose your own working hours</li>
            <li>Insurance cover on every job</li>
          </ul>
          <div className="pro-actions">
            <button className="btn btn-primary" onClick={onJoinAsPro}>Register as Professional</button>
            <button className="btn btn-light" onClick={onProLogin}>Professional Login</button>
          </div>
        </div>
        <div className="pro-card">
          <div className="pro-stat"><strong>₹42k</strong><span>avg. monthly earnings</span></div>
          <div className="pro-stat"><strong>0%</strong><span>commission, first month</span></div>
          <div className="pro-stat"><strong>4.9★</strong><span>top pro rating</span></div>
        </div>
      </div>
    </section>
  );
}
