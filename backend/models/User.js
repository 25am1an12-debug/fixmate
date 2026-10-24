import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ['customer', 'professional'], default: 'customer' },
    profession: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
