import mongoose from 'mongoose';

const matchResultSchema = mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    opportunity: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Opportunity' },
    score: { type: Number, required: true },
    explanation: { type: String }, // JSON string for breakdown
  },
  { timestamps: true }
);

const MatchResult = mongoose.model('MatchResult', matchResultSchema);

export default MatchResult;
