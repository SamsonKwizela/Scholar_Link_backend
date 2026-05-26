const express = require("express");

const { createScholarship } = require("../controllers/scholarshipController");

const router = express.Router();

// CREATE SCHOLARSHIP
router.post("/create", createScholarship);

module.exports = router;
