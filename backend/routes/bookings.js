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

// POST /api/bookings  { serviceId, variant, dateISO, slot, address }
router.post('/', async (req, res, next) => {
  try {
    const { serviceId, variant, dateISO, slot, address } = req.body;
    if (!serviceId || !variant || !dateISO || !slot || String(address || '').trim().length < 10) {
      return res.status(400).json({ ok: false, error: 'Missing booking details.' });
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
      amount: PRICES[serviceId] ?? 0,
    });
    res.json({
      ok: true,
      booking: {
        id: booking.bookingId, serviceName: booking.serviceName, variant: booking.variant,
        dateISO: booking.dateISO, slot: booking.slot, address: booking.address,
        amount: booking.amount, status: booking.status,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/bookings  — current user's bookings
router.get('/', async (req, res, next) => {
  try {
    const rows = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({
      ok: true,
      bookings: rows.map((b) => ({
        id: b.bookingId, serviceName: b.serviceName, variant: b.variant,
        dateISO: b.dateISO, slot: b.slot, address: b.address,
        amount: b.amount, status: b.status,
      })),
    });
  } catch (err) { next(err); }
});

export default router;
