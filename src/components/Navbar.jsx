import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

export default function Navbar({ onLogin, onBookNow }) {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="#top" className="brand">
          <span className="brand-mark">F</span>
          <span className="brand-name">FixMate</span>
        </a>

        <nav className="nav-links">
          <a href="#services">Services</a>
          <a href="#how">How it works</a>
          <a href="#pro">Become a Pro</a>
          <a href="#reviews">Reviews</a>
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="user-chip">
              <span className="user-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</span>
              <span className="user-name">{user.name}</span>
              <button className="link-btn" onClick={logout}>Logout</button>
            </div>
          ) : (
            <button className="btn btn-ghost" onClick={onLogin}>Login</button>
          )}
          <button className="btn btn-primary" onClick={onBookNow}>Book Now</button>
        </div>
      </div>
    </header>
  );
}
