const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");

const router = express.Router();

// GET ALL APPLICATIONS
router.get("/", protect, getApplications);

// CREATE APPLICATION
router.post("/", protect, createApplication);

// GET APPLICATION BY ID
router.get("/:id", protect, getApplicationById);

// UPDATE APPLICATION
router.put("/:id", protect, updateApplication);

// DELETE APPLICATION
router.delete("/:id", protect, deleteApplication);

module.exports = router;