import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
}, { timestamps: true });

folderSchema.index({ ownerId: 1, parentId: 1 });

export default mongoose.model('Folder', folderSchema);
