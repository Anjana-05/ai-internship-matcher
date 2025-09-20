import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const testAuth = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check existing users
    const users = await User.find({});
    console.log('\n📊 Existing users in database:');
    console.log(`Total users: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User Details:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
      console.log(`   Created: ${user.createdAt}`);
    });
    
    // Test password verification for first user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\n🔐 Testing password verification for: ${testUser.email}`);
      
      // Try common passwords
      const testPasswords = ['password', '123456', 'admin', 'test', testUser.name.toLowerCase()];
      
      for (const pwd of testPasswords) {
        try {
          const isMatch = await testUser.matchPassword(pwd);
          if (isMatch) {
            console.log(`✅ Password found: "${pwd}"`);
            break;
          } else {
            console.log(`❌ Not: "${pwd}"`);
          }
        } catch (error) {
          console.log(`❌ Error testing "${pwd}":`, error.message);
        }
      }
    }
    
    // Test creating a new test user
    console.log('\n🧪 Testing user creation...');
    const testEmail = 'test@example.com';
    
    // Delete test user if exists
    await User.deleteOne({ email: testEmail });
    
    const newUser = await User.create({
      name: 'Test User',
      email: testEmail,
      password: 'testpassword123',
      role: 'student',
      category: 'General'
    });
    
    console.log('✅ Test user created successfully');
    console.log('   ID:', newUser._id);
    console.log('   Password hash:', newUser.password.substring(0, 20) + '...');
    
    // Test password verification
    const passwordMatch = await newUser.matchPassword('testpassword123');
    console.log('✅ Password verification:', passwordMatch ? 'PASSED' : 'FAILED');
    
    // Clean up
    await User.deleteOne({ email: testEmail });
    console.log('✅ Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

testAuth();
