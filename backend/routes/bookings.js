import { Router } from 'express';
import { Booking } from '../models/Booking.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const PRICES = {
  plumbing: 149, electrical: 149, cleaning: 499, appliance: 299,
  painting: 999, carpentry: 199, pest: 449, salon: 299,
};
const NAMES = {
  plumbing: 'Plumbing', electrical: 'Electrical', cleaning: 'Home Cleaning',
  appliance: 'Appliance Repair', painting: 'Painting', carpentry: 'Carpentry',
  pest: 'Pest Control', salon: 'Salon at Home',
};

// One shape for every booking the client sees.
// customerName/customerPhone are filled only when the booking's user is
// populated (the professional's view) — customers never receive them.
function toClient(b) {
  return {
    id: b.bookingId, serviceName: b.serviceName, variant: b.variant,
    dateISO: b.dateISO, slot: b.slot, address: b.address,
    amount: b.amount, status: b.status,
    location: b.location && b.location.lat != null ? { lat: b.location.lat, lng: b.location.lng } : null,
    paymentStatus: b.paymentStatus || 'pending',
    rating: b.rating || null, review: b.review || '',
    proId: b.proId ? String(b.proId) : null,
    proName: b.proName || '', proPhone: b.proPhone || '',
    customerName: b.user && b.user.name ? b.user.name : '',
    customerPhone: b.user && b.user.phone ? b.user.phone : '',
  };
}

// POST /api/bookings  { serviceId, variant, dateISO, slot, address }
router.post('/', async (req, res, next) => {
  try {
    const { serviceId, variant, dateISO, slot, address, location } = req.body;
    if (!serviceId || !variant || !dateISO || !slot || String(address || '').trim().length < 10) {
      return res.status(400).json({ ok: false, error: 'Missing booking details.' });
    }
    // Optional GPS location from the customer's phone (free browser GPS).
    // Validated only when present — a bad value is ignored, never fatal.
    let loc = null;
    if (location && typeof location.lat === 'number' && typeof location.lng === 'number'
      && location.lat >= -90 && location.lat <= 90 && location.lng >= -180 && location.lng <= 180) {
      loc = { lat: location.lat, lng: location.lng };
    }
    const bookingId = 'BK_' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      serviceId,
      serviceName: NAMES[serviceId] || serviceId,
      variant,
      dateISO,
      slot,
      address: String(address).trim(),
      location: loc,
      amount: PRICES[serviceId] ?? 0,
    });
    res.json({ ok: true, booking: toClient(booking) });
  } catch (err) { next(err); }
});

// GET /api/bookings
// Customer: only their own bookings.
// Professional (Pro Dashboard): bookings they accepted + new confirmed
// bookings not yet taken by any pro, with the customer's name/phone.
router.get('/', async (req, res, next) => {
  try {
    if (req.user.role === 'professional') {
      const rows = await Booking.find({
        $or: [
          { proId: req.user._id },
          { proId: null, status: 'confirmed' },
        ],
      }).sort({ createdAt: -1 }).populate('user', 'name phone').lean();
      return res.json({ ok: true, bookings: rows.map(toClient) });
    }
    const rows = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ ok: true, bookings: rows.map(toClient) });
  } catch (err) { next(err); }
});

// PATCH /api/bookings/:id  (id = BK_... id)
// Customer actions (booking owner only):
// { action: 'cancel' }   — confirmed -> cancelled
// { action: 'complete' } — confirmed/in_progress -> completed (customer confirms the job is done)
// { action: 'pay' }      — completed + unpaid -> paid (money moves outside the app: cash/UPI to the pro)
// { action: 'reschedule', dateISO, slot } — confirmed -> new date & slot (no extra charge)
// { action: 'rate', rating: 1-5, review? } — completed, once only
// Professional actions (Pro Dashboard):
// { action: 'accept' }      — professional only; confirmed + untaken -> assigned to this pro, status in_progress
// { action: 'pro_complete' } — the assigned professional only; in_progress -> completed
router.patch('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found.' });
    const { action } = req.body || {};
    if (action === 'accept') {
      if (req.user.role !== 'professional') return res.status(403).json({ ok: false, error: 'Only professionals can accept bookings.' });
      if (booking.status !== 'confirmed') return res.status(400).json({ ok: false, error: 'This booking is no longer available.' });
      if (booking.proId) return res.status(400).json({ ok: false, error: 'This booking is already taken by another professional.' });
      booking.proId = req.user._id;
      booking.proName = req.user.name;
      booking.proPhone = req.user.phone;
      booking.status = 'in_progress';
      await booking.save();
      return res.json({ ok: true, booking: toClient(booking) });
    }
    if (action === 'pro_complete') {
      if (req.user.role !== 'professional') return res.status(403).json({ ok: false, error: 'Only professionals can complete jobs.' });
      if (!booking.proId || String(booking.proId) !== String(req.user._id)) return res.status(403).json({ ok: false, error: 'This booking is not assigned to you.' });
      if (booking.status !== 'in_progress') return res.status(400).json({ ok: false, error: 'Only an accepted booking can be marked done.' });
      booking.status = 'completed';
      await booking.save();
      return res.json({ ok: true, booking: toClient(booking) });
    }
    // All remaining actions belong to the customer who owns the booking.
    if (String(booking.user) !== String(req.user._id)) {
      return res.status(404).json({ ok: false, error: 'Booking not found.' });
    }
    if (action === 'cancel') {
      if (booking.status !== 'confirmed') return res.status(400).json({ ok: false, error: 'Only a confirmed booking can be cancelled.' });
      booking.status = 'cancelled';
    } else if (action === 'complete') {
      if (!['confirmed', 'in_progress'].includes(booking.status)) return res.status(400).json({ ok: false, error: 'Only a confirmed booking can be marked done.' });
      booking.status = 'completed';
    } else if (action === 'pay') {
      if (booking.status !== 'completed') return res.status(400).json({ ok: false, error: 'Payment is due only after the job is done.' });
      if (booking.paymentStatus === 'paid') return res.status(400).json({ ok: false, error: 'This booking is already paid.' });
      booking.paymentStatus = 'paid';
    } else if (action === 'reschedule') {
      if (booking.status !== 'confirmed') return res.status(400).json({ ok: false, error: 'Only a confirmed booking can be rescheduled.' });
      const { dateISO, slot } = req.body || {};
      if (!dateISO || !slot) return res.status(400).json({ ok: false, error: 'Choose a new date and time slot.' });
      booking.dateISO = dateISO;
      booking.slot = slot;
    } else if (action === 'rate') {
      const rating = Number(req.body.rating);
      if (booking.status !== 'completed') return res.status(400).json({ ok: false, error: 'You can rate only after the job is done.' });
      if (booking.rating) return res.status(400).json({ ok: false, error: 'You have already rated this booking.' });
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ ok: false, error: 'Rating must be 1 to 5 stars.' });
      booking.rating = rating;
      if (typeof req.body.review === 'string' && req.body.review.trim()) booking.review = req.body.review.trim().slice(0, 500);
    } else {
      return res.status(400).json({ ok: false, error: 'Unknown action.' });
    }
    await booking.save();
    res.json({ ok: true, booking: toClient(booking) });
  } catch (err) { next(err); }
});

export default router;
