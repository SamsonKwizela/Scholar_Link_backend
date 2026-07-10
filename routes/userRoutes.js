const express = require("express");
const { protect } = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/userController");

const router = express.Router();

// GET USER PROFILE
router.get("/profile", protect, getProfile);

// UPDATE USER PROFILE
router.put("/profile", protect, updateProfile);

module.exports = router;