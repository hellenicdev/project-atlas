import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, default: '', maxlength: 20000 },
  color: { type: String, default: '#7c6cf7' },
  pinned: { type: Boolean, default: false },
  tags: [{ type: String, lowercase: true, trim: true }],
}, { timestamps: true });

noteSchema.index({ ownerId: 1, pinned: -1, updatedAt: -1 });
noteSchema.index({ ownerId: 1, updatedAt: -1 });

export default mongoose.model('Note', noteSchema);

