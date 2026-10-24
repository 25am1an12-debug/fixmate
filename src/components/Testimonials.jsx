import React from 'react';
import './Testimonials.css';

const reviews = [
  { name: 'Priya Sharma', area: 'Andheri West, Mumbai', text: 'Plumber arrived in 40 minutes and fixed a leak two others couldn\'t. Upfront price, no haggling. Brilliant.', service: 'Plumbing' },
  { name: 'Rahul Verma', area: 'HSR Layout, Bengaluru', text: 'Booked a full home deep clean. The team was professional, punctual and thorough. My flat looks brand new.', service: 'Home Cleaning' },
  { name: 'Ananya Iyer', area: 'Anna Nagar, Chennai', text: 'AC servicing was quick and the technician explained everything. The OTP login and slot booking took two minutes.', service: 'Appliance Repair' },
];

export default function Testimonials() {
  return (
    <section className="section" id="reviews">
      <div className="container">
        <div className="center">
          <h2 className="section-title">Loved by households</h2>
          <p className="section-sub">Real reviews from real customers.</p>
        </div>
        <div className="reviews">
          {reviews.map((r) => (
            <figure key={r.name} className="review">
              <div className="stars">★★★★★</div>
              <blockquote>"{r.text}"</blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                <span>{r.area} · {r.service}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
