import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    variant: { type: String, required: true },
    dateISO: { type: String, required: true },
    slot: { type: String, required: true },
    address: { type: String, required: true },
    // GPS location saved at booking time (customer's phone, free browser GPS) —
    // the pro taps "Open in Maps" on the booking to navigate straight there.
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'in_progress', 'completed', 'cancelled'], default: 'confirmed' },
    // Payment happens only AFTER the job is done — never upfront.
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    // Customer rates the pro once the job is done (1-5 stars + optional review).
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
