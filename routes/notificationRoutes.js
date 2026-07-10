const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

// GET USER NOTIFICATIONS
router.get("/", protect, getNotifications);

// MARK NOTIFICATION AS READ
router.patch("/:id/read", protect, markNotificationAsRead);

module.exports = router;