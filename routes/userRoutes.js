const express = require("express");
const { protect } = require("../middleware/auth");
const { getProfile, updateProfile, getEmailPreferences, updateEmailPreferences } = require("../controllers/userController");

const router = express.Router();

// GET USER PROFILE
router.get("/profile", protect, getProfile);

// UPDATE USER PROFILE
router.put("/profile", protect, updateProfile);

// GET EMAIL PREFERENCES
router.get("/email-preferences", protect, getEmailPreferences);

// UPDATE EMAIL PREFERENCES
router.put("/email-preferences", protect, updateEmailPreferences);

module.exports = router;
