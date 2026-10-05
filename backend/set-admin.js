import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env') });

const USERNAME = process.env.ADMIN_USERNAME || 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin@123';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'village-allure' });
    console.log('MongoDB connected');

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);
    const user = await User.findOneAndUpdate(
      { username: USERNAME },
      { $set: { password: hashedPassword, role: 'admin' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Admin ready: ${user.username} / ${PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('set-admin error:', error.message);
    process.exit(1);
  }
};

run();
