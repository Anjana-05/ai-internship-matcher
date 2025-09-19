import mongoose from 'mongoose';

const opportunitySchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // FK to User
    location: { type: String, required: true },
    sector: { type: String, required: true }, // comma-separated string or tags
    duration: { type: String, required: true },
    capacity: { type: Number, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'published', enum: ['published', 'draft'] },
    affirmativeCategory: { type: String, enum: ['General', 'SC', 'ST', 'OBC', 'PWD'] }, // camelCase
  },
  { timestamps: true }
);

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

export default Opportunity;
