const Application = require("../models/Application");
const AppError = require("../utils/appError");
const { createSuccessResponse } = require("../utils/response");

// GET ALL APPLICATIONS
const getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate("student", "firstName lastName email")
      .populate("scholarship", "title provider")
      .sort("-submittedAt");

    res.status(200).json(createSuccessResponse({ applications }));
  } catch (error) {
    next(error);
  }
};

// CREATE APPLICATION
const createApplication = async (req, res, next) => {
  try {
    const { scholarshipId, fullName, email, phoneNumber, motivationLetter } = req.body;

    const application = await Application.create({
      student: req.user._id,
      scholarship: scholarshipId,
      fullName,
      email,
      phoneNumber,
      motivationLetter,
    });

    res.status(201).json(createSuccessResponse({ application }));
  } catch (error) {
    next(error);
  }
};

// GET APPLICATION BY ID
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("student", "firstName lastName email phoneNumber")
      .populate("scholarship", "title provider description");

    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    res.status(200).json(createSuccessResponse({ application }));
  } catch (error) {
    next(error);
  }
};

// UPDATE APPLICATION
const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    // Check if user owns the application
    if (application.student.toString() !== req.user._id.toString()) {
      return next(new AppError("Not authorized to update this application", 403));
    }

    Object.assign(application, req.body);
    const updatedApplication = await application.save();

    res.status(200).json(createSuccessResponse({ application: updatedApplication }));
  } catch (error) {
    next(error);
  }
};

// DELETE APPLICATION
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    // Check if user owns the application
    if (application.student.toString() !== req.user._id.toString()) {
      return next(new AppError("Not authorized to delete this application", 403));
    }

    await application.deleteOne();

    res.status(200).json(createSuccessResponse({ message: "Application deleted successfully" }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
};