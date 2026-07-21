const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const {
  getAllNotifications,
  markNotificationAsRead,
  getEmailHistory,
  sendBroadcastEmail,
  sendNotification,
  notifyScholarship,
  notifyInternship,
} = require("../controllers/emailController");

const router = express.Router();

// Student routes
router.get("/", protect, getAllNotifications);
router.patch("/:id/read", protect, markNotificationAsRead);
router.get("/email-history", protect, getEmailHistory);

// Admin routes
router.post("/broadcast", protect, authorizeRoles("admin"), sendBroadcastEmail);
router.post("/send", protect, authorizeRoles("admin"), sendNotification);
router.post("/scholarship", protect, authorizeRoles("admin"), notifyScholarship);
router.post("/internship", protect, authorizeRoles("admin"), notifyInternship);

module.exports = router;