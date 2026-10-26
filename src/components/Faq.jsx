import React, { useState } from 'react';
import './Faq.css';

// Every answer matches what the site actually does — no invented
// policies. Cancel / pay / rate questions are here because those
// flows now exist on the My Bookings page.
const QA = [
  {
    q: 'How do I book a service?',
    a: 'Pick a service, choose a variant and a date/time slot, add your address, then review and tap Confirm. Once your booking is confirmed, you will get a Booking ID (BK_...).',
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Yes — open My Bookings, tap your booking and tap Cancel booking. You can cancel while the booking is still confirmed.',
  },
  {
    q: 'Can I reschedule my booking?',
    a: 'Yes — open My Bookings, tap your booking and tap Reschedule. Pick a new date and time slot. You can reschedule while the booking is still confirmed, at no extra charge.',
  },
  {
    q: 'How will the pro find my home?',
    a: 'While booking, tap "Use my current location" — your GPS location is saved with the booking. The pro can tap "Open in Maps" on your booking to navigate straight to your home.',
  },
  {
    q: 'When do I pay?',
    a: 'Only after the job is done. Once the job is done, tap Pay on your booking — pay the pro by cash or UPI, then mark it as paid in the app.',
  },
  {
    q: 'Can I rate the professional?',
    a: 'Yes — once the job is done, open My Bookings, mark the job as done, then rate your pro from 1 to 5 stars. You can also leave a short review.',
  },
  {
    q: 'Are there any hidden charges?',
    a: 'No. The price you see on the card is the final price — no "starting at", no extra charges later, no separate visit fee.',
  },
  {
    q: 'How do I track my booking?',
    a: 'Log in and open My Bookings. Tap your booking, or enter your Booking ID (BK_...) and tap Track — you will see a live timeline: Requested → Pro assigned → Pro on the way → Job done → Payment.',
  },
  {
    q: 'Are the professionals verified?',
    a: 'Yes, all pros are background-verified.',
  },
  {
    q: 'What if I am not happy with the job?',
    a: 'There is a service guarantee — if you are not happy, you get a free re-service or a refund.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq" id="faq">
      <div className="container">
        <div className="center">
          <h2 className="section-title">Frequently asked questions</h2>
          <p className="section-sub">Everything about booking, payment and tracking — answered in one place.</p>
        </div>
        <div className="faq-list">
          {QA.map((item, i) => (
            <div key={item.q} className={`faq-item${open === i ? ' open' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{item.q}</span>
                <span className="faq-chevron">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <p className="faq-a">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
