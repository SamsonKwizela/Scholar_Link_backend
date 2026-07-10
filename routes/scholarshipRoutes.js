const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");

const {
  createScholarship,
  getScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
} = require("../controllers/scholarshipController");

const router = express.Router();

// CREATE SCHOLARSHIP (Admin)
router.post("/create", protect, authorizeRoles("admin"), createScholarship);

// GET ALL SCHOLARSHIPS
router.get("/", getScholarships);

// GET SCHOLARSHIP BY ID
router.get("/:id", getScholarshipById);

// UPDATE SCHOLARSHIP (Admin)
router.put("/:id", protect, authorizeRoles("admin"), updateScholarship);

// DELETE SCHOLARSHIP (Admin)
router.delete("/:id", protect, authorizeRoles("admin"), deleteScholarship);

module.exports = router;
