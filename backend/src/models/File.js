import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  isTrashed: { type: Boolean, default: false },
  version: { type: Number, default: 1 },
  sharingLink: { type: String, default: null },
}, { timestamps: true });

fileSchema.index({ ownerId: 1 });
fileSchema.index({ folderId: 1 });

export default mongoose.model('File', fileSchema);
