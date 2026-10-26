import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import ProCta from './components/ProCta.jsx';
import Testimonials from './components/Testimonials.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import BookingModal from './components/BookingModal.jsx';
import TrackBooking from './components/TrackBooking.jsx';
import Faq from './components/Faq.jsx';
import { useAuth } from './context/AuthContext.jsx';
import './App.css';

export default function App() {
  const { user } = useAuth();
  const [auth, setAuth] = useState({ open: false, mode: 'login', role: 'customer' });
  const [booking, setBooking] = useState({ open: false, service: null });
  const [view, setView] = useState('home'); // home | track

  const goTrack = () => { setView('track'); window.scrollTo({ top: 0 }); };
  const goHome = () => { setView('home'); window.scrollTo({ top: 0 }); };

  const openLogin = () => setAuth({ open: true, mode: 'login', role: 'customer' });
  const openLoginPro = () => setAuth({ open: true, mode: 'login', role: 'professional' });
  const openRegisterPro = () => setAuth({ open: true, mode: 'register', role: 'professional' });
  const closeAuth = () => setAuth((a) => ({ ...a, open: false }));

  const startBooking = (service) => setBooking({ open: true, service });
  const closeBooking = () => setBooking({ open: false, service: null });

  // Navbar "Book Now" with no service chosen -> scroll to services
  const handleBookNow = () => {
    if (view !== 'home') {
      setView('home');
      setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 80);
      return;
    }
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  // BookingModal asks for login when confirming without a session
  const requireLogin = () => {
    setBooking((b) => ({ ...b, open: false }));
    openLogin();
  };

  return (
    <div className="app">
      <Navbar onLogin={openLogin} onProLogin={openLoginPro} onBookNow={handleBookNow} onMyBookings={goTrack} onHome={goHome} />

      <main>
        {view === 'track' ? (
          <TrackBooking onBack={goHome} onLogin={openLogin} onBookNow={handleBookNow} />
        ) : (
          <>
            <Hero onSelectService={startBooking} />
            <Services onSelectService={startBooking} />
            <HowItWorks onTrack={goTrack} />
            <ProCta onJoinAsPro={openRegisterPro} onProLogin={openLoginPro} />
            <Testimonials />
            <Faq />
          </>
        )}
      </main>

      <Footer />

      <AuthModal
        open={auth.open}
        initialMode={auth.mode}
        initialRole={auth.role}
        onClose={closeAuth}
      />

      <BookingModal
        open={booking.open}
        service={booking.service}
        onClose={closeBooking}
        onRequireLogin={requireLogin}
      />
    </div>
  );
}
