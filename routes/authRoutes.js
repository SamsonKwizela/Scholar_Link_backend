const express = require("express");

const { registerUser, loginUser, createUser, getAllUsers } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// CREATE USER (Admin)
router.post("/create-user", protect, authorizeRoles('admin'), createUser);

// GET ALL USERS (Admin)
router.get("/users", protect, authorizeRoles('admin'), getAllUsers);

module.exports = router;
