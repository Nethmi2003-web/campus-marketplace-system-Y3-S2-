/**
 * Database Seeder — Populates MongoDB with initial users
 * Run: node seed.js
 * 
 * Creates:
 *  - 1 Admin user (login: admin@sliit.lk / Admin@1234)
 *  - 5 Sample student users with various statuses
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const seedUsers = [
  {
    fullName: 'Admin Master',
    studentId: 'AD00000001',
    faculty: 'Staff',
    phoneNo: '+94 11 222 3333',
    email: 'admin@sliit.lk',
    password: 'Admin@1234',
    role: 'Admin',
    status: 'approved',
    isEmailVerified: true,
    idPhotoUrl: 'https://i.pravatar.cc/150?u=admin',
  },
  {
    fullName: 'John Doe',
    studentId: 'IT21000001',
    faculty: 'Computing',
    phoneNo: '+94 77 111 1111',
    email: 'it21000001@my.sliit.lk',
    password: 'Student@123',
    role: 'Student',
    status: 'pending',
    isEmailVerified: true,
    idPhotoUrl: 'https://i.pravatar.cc/150?u=1',
  },
  {
    fullName: 'Sarah Connor',
    studentId: 'IT21000002',
    faculty: 'Business',
    phoneNo: '+94 77 222 2222',
    email: 'it21000002@my.sliit.lk',
    password: 'Student@123',
    role: 'Seller',
    status: 'approved',
    isEmailVerified: true,
    idPhotoUrl: 'https://i.pravatar.cc/150?u=2',
  },
  {
    fullName: 'Bob Smith',
    studentId: 'BM19000000',
    faculty: 'Engineering',
    phoneNo: '+94 77 333 3333',
    email: 'bm19000000@my.sliit.lk',
    password: 'Student@123',
    role: 'Student',
    status: 'rejected',
    isEmailVerified: false,
    idPhotoUrl: '',
  },
  {
    fullName: 'Alice Eve',
    studentId: 'IT21000004',
    faculty: 'Computing',
    phoneNo: '+94 77 444 4444',
    email: 'it21000004@my.sliit.lk',
    password: 'Student@123',
    role: 'Student',
    status: 'blocked',
    isEmailVerified: true,
    idPhotoUrl: 'https://i.pravatar.cc/150?u=4',
  },
  {
    fullName: 'Nethmi Perera',
    studentId: 'IT21000005',
    faculty: 'Computing',
    phoneNo: '+94 77 555 5555',
    email: 'it21000005@my.sliit.lk',
    password: 'Student@123',
    role: 'Student',
    status: 'approved',
    isEmailVerified: true,
    idPhotoUrl: 'https://i.pravatar.cc/150?u=5',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Hash passwords and insert
    for (const userData of seedUsers) {
      const salt = await bcrypt.genSalt(12);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    await User.insertMany(seedUsers);
    console.log(`🌱 Seeded ${seedUsers.length} users successfully!`);
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:   admin@sliit.lk / Admin@1234');
    console.log('   Student: it21000001@my.sliit.lk / Student@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
