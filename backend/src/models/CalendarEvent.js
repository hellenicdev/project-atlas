import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 5000 },
  location: { type: String, default: '', maxlength: 200 },
  startAt: { type: Date, required: true },
  endAt: { type: Date, default: null },
  allDay: { type: Boolean, default: false },
  color: { type: String, default: '#7c6cf7' },
  reminderMinutes: { type: Number, default: null },
}, { timestamps: true });

calendarEventSchema.index({ ownerId: 1, startAt: 1 });
calendarEventSchema.index({ ownerId: 1, updatedAt: -1 });

export default mongoose.model('CalendarEvent', calendarEventSchema);

