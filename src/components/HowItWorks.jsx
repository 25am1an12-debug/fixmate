import React from 'react';
import './HowItWorks.css';

const steps = [
  { n: '1', title: 'Pick a service', text: 'Choose from 8+ home services with transparent, upfront pricing.' },
  { n: '2', title: 'Choose your slot', text: 'Select a date and time that suits you — same-day slots available.' },
  { n: '3', title: 'Pro arrives', text: 'A background-verified professional arrives on time, with the right tools.' },
  { n: '4', title: 'Pay & rate', text: 'Pay securely after the job and rate your experience.' },
];

export default function HowItWorks() {
  return (
    <section className="section how" id="how">
      <div className="container">
        <div className="center">
          <h2 className="section-title">Fixed in four simple steps</h2>
          <p className="section-sub">From booking to done — without a single phone call.</p>
        </div>
        <div className="steps">
          {steps.map((s) => (
            <div key={s.n} className="step">
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
