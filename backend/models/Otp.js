import mongoose from 'mongoose';

// OTP documents auto-delete 5 minutes after creation (TTL index on createdAt)
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

export const Otp = mongoose.model('Otp', otpSchema);
