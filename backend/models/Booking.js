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
    amount: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'in_progress', 'completed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
