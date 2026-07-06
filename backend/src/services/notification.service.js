import { Notification } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getNotifications = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ userId }),
    Notification.countDocuments({ userId, read: false }),
  ]);
  return { notifications, total, unreadCount, page, totalPages: Math.ceil(total / limit) };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  notification.read = true;
  await notification.save();
  return notification;
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, read: false }, { read: true });
};

export const createNotification = async ({ userId, type, message, relatedId }) => {
  const notification = await Notification.create({ userId, type, message, relatedId });
  return notification;
};
