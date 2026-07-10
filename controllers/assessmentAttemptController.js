const Assessment = require("../models/Assessment");
const AssessmentAttempt = require("../models/AssessmentAttempt");
const AppError = require("../utils/appError");
const { createSuccessResponse } = require("../utils/response");

// CREATE ASSESSMENT ATTEMPT
const createAssessmentAttempt = async (req, res, next) => {
  try {
    const { assessmentId } = req.body;

    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      return next(new AppError("Assessment not found", 404));
    }

    // Create attempt
    const attempt = await AssessmentAttempt.create({
      assessment: assessmentId,
      user: req.user._id,
      answers: [],
    });

    res.status(201).json(createSuccessResponse({ attempt }));
  } catch (error) {
    next(error);
  }
};

// SUBMIT ASSESSMENT ATTEMPT
const submitAssessmentAttempt = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const attemptId = req.params.attemptId;

    const attempt = await AssessmentAttempt.findById(attemptId);

    if (!attempt) {
      return next(new AppError("Assessment attempt not found", 404));
    }

    // Check if attempt belongs to user
    if (attempt.user.toString() !== req.user._id.toString()) {
      return next(new AppError("Not authorized", 403));
    }

    // Update attempt with answers
    attempt.answers = answers;
    attempt.submittedAt = Date.now();
    const updatedAttempt = await attempt.save();

    res.status(200).json(createSuccessResponse({ attempt: updatedAttempt }));
  } catch (error) {
    next(error);
  }
};

// GET ALL ASSESSMENT ATTEMPTS
const getAssessmentAttempts = async (req, res, next) => {
  try {
    const attempts = await AssessmentAttempt.find({ user: req.user._id })
      .populate("assessment", "title description")
      .sort("-submittedAt");

    res.status(200).json(createSuccessResponse({ attempts }));
  } catch (error) {
    next(error);
  }
};

// GET ASSESSMENT ATTEMPT BY ID
const getAssessmentAttemptById = async (req, res, next) => {
  try {
    const attempt = await AssessmentAttempt.findById(req.params.attemptId)
      .populate("assessment", "title description questions")
      .populate("user", "firstName lastName email");

    if (!attempt) {
      return next(new AppError("Assessment attempt not found", 404));
    }

    res.status(200).json(createSuccessResponse({ attempt }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssessmentAttempt,
  getAssessmentAttempts,
  getAssessmentAttemptById,
  submitAssessmentAttempt,
};
