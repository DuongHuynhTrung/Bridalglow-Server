const Notification = require("../models/Notification");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

/**
 * @desc Get all notifications
 * @route GET /api/notifications
 * @access Private
 */
const getAllNotificationsOfUser = asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver_id: req.user.id });

    if (!notifications) {
      res.status(404);
      throw new Error("No notifications found");
    }

    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

/**
 * @desc Get a single notification by ID
 * @route GET /api/notifications/:id
 * @access Private
 */
const getNotificationById = asyncHandler(async (req, res) => {
  try {
    const notification = await Notification.findById(
      req.params.notification_id
    );
    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    res.status(200).json(notification);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

/**
 * @desc Update all notifications to 'seen' for a user
 * @route PUT /api/notifications/:id
 * @access Private
 */
const updateAllNotificationIsSeen = asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver_id: req.user.id });
    if (!notifications || notifications.length === 0) {
      res.status(404);
      throw new Error("User doesn't have notifications");
    }

    await Notification.updateMany(
      { receiver_id: req.user.id },
      { $set: { is_new: false } }
    );

    res.status(200).json(await Notification.find({ receiver_id: req.user.id }));
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

/**
 * @desc Update a single notification to 'seen'
 * @route PUT /api/notifications/:id
 * @access Private
 */
const updateNotificationIsSeen = asyncHandler(async (req, res) => {
  try {
    const notification = await Notification.findById(
      req.params.notification_id
    );
    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    notification.is_new = false;
    const updatedNotification = await notification.save();
    res.status(200).json(updatedNotification);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

/**
 * @desc Update all notifications to 'seen' for a user
 * @route PUT /api/notifications/:id
 * @access Private
 */
const deleteAllNotificationOfUserByAdmin = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;
    const notifications = await Notification.find({ receiver_id: user_id });
    if (!notifications || notifications.length === 0) {
      res.status(404);
      throw new Error("User doesn't have notifications");
    }

    await Notification.deleteMany({ receiver_id: user_id });

    res.status(200).json({ message: "All Notification Deleted" });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const deleteAllNotificationByAdmin = asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find();
    if (!notifications || notifications.length === 0) {
      res.status(404);
      throw new Error("User doesn't have notifications");
    }

    await Notification.deleteMany();

    res.status(200).json({ message: "All Notification Deleted" });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

/**
 * @desc Update a single notification to 'seen'
 * @route PUT /api/notifications/:id
 * @access Private
 */
const deleteNotificationByAdmin = asyncHandler(async (req, res) => {
  try {
    const notification = await Notification.findById(
      req.params.notification_id
    );
    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    await Notification.findByIdAndDelete(req.params.notification_id);

    res.status(200).json({ message: "Notification Deleted" });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

module.exports = {
  getAllNotificationsOfUser,
  getNotificationById,
  updateAllNotificationIsSeen,
  updateNotificationIsSeen,
  deleteAllNotificationOfUserByAdmin,
  deleteNotificationByAdmin,
  deleteAllNotificationByAdmin,
};
