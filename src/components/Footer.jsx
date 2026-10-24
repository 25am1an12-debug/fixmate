import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <span className="brand-mark">F</span>
            <span className="brand-name light">FixMate</span>
          </div>
          <p className="footer-tag">Trusted home services at your doorstep.</p>
        </div>
        <div>
          <h4>Services</h4>
          <a href="#services">Plumbing</a>
          <a href="#services">Electrical</a>
          <a href="#services">Home Cleaning</a>
          <a href="#services">Appliance Repair</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="#how">How it works</a>
          <a href="#pro">Become a Pro</a>
          <a href="#reviews">Reviews</a>
        </div>
        <div>
          <h4>Support</h4>
          <a href="#top">Help center</a>
          <a href="#top">Terms of service</a>
          <a href="#top">Privacy policy</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 FixMate. All rights reserved.</span>
        <span>Made for homes that deserve better.</span>
      </div>
    </footer>
  );
}
