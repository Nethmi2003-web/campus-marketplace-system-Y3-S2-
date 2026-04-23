const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const clearDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Drop the users collection entirely to get rid of old indexes
    await mongoose.connection.db.dropCollection('users').catch(e => console.log('users collection already dropped'));
    console.log('🗑️  Dropped users collection');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

clearDB();
