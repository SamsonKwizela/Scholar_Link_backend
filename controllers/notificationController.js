const Notification = require("../models/Notification");
const AppError = require("../utils/appError");
const { createSuccessResponse } = require("../utils/response");

// GET USER NOTIFICATIONS
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort("-createdAt");

    res.status(200).json(createSuccessResponse({ notifications }));
  } catch (error) {
    next(error);
  }
};

// MARK NOTIFICATION AS READ
const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    // Check if notification belongs to user
    if (notification.user.toString() !== req.user._id.toString()) {
      return next(new AppError("Not authorized", 403));
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(createSuccessResponse({ notification }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
};