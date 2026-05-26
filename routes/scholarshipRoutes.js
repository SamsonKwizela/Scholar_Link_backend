const express = require("express");

const {
  createScholarship,
  getScholarships,
  updateScholarship,
  deleteScholarship,
} = require("../controllers/scholarshipController");

const router = express.Router();

// CREATE SCHOLARSHIP
router.post("/create", createScholarship);

// GET ALL SCHOLARSHIPS
router.get("/", getScholarships);

// UPDATE SCHOLARSHIP
router.put("/:id", updateScholarship);

// DELETE SCHOLARSHIP
router.delete("/:id", deleteScholarship);

module.exports = router;
