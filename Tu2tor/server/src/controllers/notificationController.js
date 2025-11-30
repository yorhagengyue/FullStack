import Notification from '../models/Notification.js';

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { userId: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
      message: error.message
    });
  }
};

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification
 * @access  Private (internal use or admin)
 */
export const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, relatedId, relatedModel, metadata } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'userId, type, title, and message are required'
      });
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      metadata
    });

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      error: 'Failed to create notification',
      message: error.message
    });
  }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'No notification found with this ID'
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      error: 'Failed to update notification',
      message: error.message
    });
  }
};

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      error: 'Failed to update notifications',
      message: error.message
    });
  }
};

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'No notification found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: error.message
    });
  }
};

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all notifications for current user
 * @access  Private
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });

    res.json({
      success: true,
      message: 'All notifications deleted successfully'
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      error: 'Failed to delete notifications',
      message: error.message
    });
  }
};

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to get unread count',
      message: error.message
    });
  }
};

// Helper function to create notifications (for internal use)
export const createNotificationInternal = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('Create notification internal error:', error);
    return null;
  }
};

export default {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  createNotificationInternal
};

