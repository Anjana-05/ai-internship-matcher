import mongoose from 'mongoose';

const applicationSchema = mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // FK to User
    opportunity: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Opportunity' }, // FK to Opportunity
    status: { type: String, default: 'applied', enum: ['applied', 'pending', 'selected', 'rejected'] },

    // Personal Info
    fullName: { type: String },
    email: { type: String },
    phone: { type: String },
    locationPreference: { type: String },

    // Academic Details
    educationLevel: { type: String }, // Diploma / UG / PG / Other
    degreeMajor: { type: String },
    yearOfStudy: { type: String }, // 1st / 2nd / 3rd / Final
    cgpa: { type: Number },

    // Skills & Interests
    skills: [{ type: String }],
    sectorInterests: [{ type: String }],
    pastInternship: { type: String },

    // Affirmative Action Info
    isRuralOrAspirational: { type: Boolean, default: false },
    socialCategory: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', ''], default: '' },
    hasDisability: { type: Boolean, default: false },

    // Resume
    resume: {
      fileName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      url: { type: String }, // public URL to access resume
      path: { type: String }, // server path
    },
  },
  { timestamps: true }
);

const Application = mongoose.model('Application', applicationSchema);

export default Application;
