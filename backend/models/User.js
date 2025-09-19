import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['student', 'industry', 'admin'] },
    
    // Student-specific fields
    category: { type: String, enum: ['General', 'SC', 'ST', 'OBC', 'PWD'], default: 'General' },
    skills: { type: String }, // comma-separated string
    education: { type: String },
    locationPreferences: { type: String }, // camelCase

    // Industry-specific fields
    companyName: { type: String }, // camelCase
    companyInfo: { type: String }, // camelCase
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
