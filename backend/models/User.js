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
    skills: [{ type: String }], // Array of skills (predefined + custom)
    education: { type: String },
    locationPreferences: { type: String },
    
    // Enhanced Profile Fields for Students
    profile: {
      // Required Documents
      resume: {
        filename: { type: String },
        originalName: { type: String },
        path: { type: String },
        uploadedAt: { type: Date }
      },
      marksheet: {
        filename: { type: String },
        originalName: { type: String },
        path: { type: String },
        uploadedAt: { type: Date }
      },
      communityCertificate: {
        filename: { type: String },
        originalName: { type: String },
        path: { type: String },
        uploadedAt: { type: Date }
      },
      
      // Optional Links
      linkedinUrl: { type: String },
      githubUrl: { type: String },
      leetcodeUrl: { type: String },
      
      // Extra Certificates (Multiple uploads)
      extraCertificates: [{
        filename: { type: String },
        originalName: { type: String },
        path: { type: String },
        description: { type: String }, // e.g., "AWS Certification", "React Course"
        uploadedAt: { type: Date, default: Date.now }
      }],
      
      // Profile completion status
      isProfileComplete: { type: Boolean, default: false },
      lastUpdated: { type: Date, default: Date.now }
    },

    // Industry-specific fields
    companyName: { type: String },
    companyInfo: { type: String },
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
