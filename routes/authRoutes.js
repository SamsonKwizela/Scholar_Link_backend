const express = require("express");

const { registerUser, loginUser, createUser } = require("../controllers/authController");

const router = express.Router();

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// CREATE USER (Admin)
router.post("/create-user", createUser);

module.exports = router;
