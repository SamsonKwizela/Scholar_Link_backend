const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createAssessmentAttempt,
  getAssessmentAttempts,
  getAssessmentAttemptById,
  submitAssessmentAttempt,
} = require("../controllers/assessmentAttemptController");

const router = express.Router();

// GET ALL ASSESSMENT ATTEMPTS
router.get("/", protect, getAssessmentAttempts);

// CREATE ASSESSMENT ATTEMPT
router.post("/", protect, createAssessmentAttempt);

// GET ASSESSMENT ATTEMPT BY ID
router.get("/:attemptId", protect, getAssessmentAttemptById);

// SUBMIT ASSESSMENT ATTEMPT
router.post("/:attemptId/submit", protect, submitAssessmentAttempt);

module.exports = router;
