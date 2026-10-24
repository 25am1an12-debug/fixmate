import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<username>')) {
    console.error('\n❌ MONGODB_URI is missing in backend/.env');
    console.error('   1. Create a free cluster at https://cloud.mongodb.com');
    console.error('   2. Copy backend/.env.example to backend/.env');
    console.error('   3. Paste your connection string as MONGODB_URI\n');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}
