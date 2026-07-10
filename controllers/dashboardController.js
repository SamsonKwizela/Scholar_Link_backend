const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const Assessment = require('../models/Assessment');
const Internship = require('../models/Internship');
const { createSuccessResponse } = require('../utils/response');

const getDashboardStats = async (req, res, next) => {
  try {
    const [scholarships, applications, assessments, internships] = await Promise.all([
      Scholarship.countDocuments(),
      Application.countDocuments(),
      Assessment.countDocuments(),
      Internship.countDocuments(),
    ]);

    res.status(200).json(createSuccessResponse({
      scholarships,
      applications,
      assessments,
      internships,
    }));
  } catch (error) {
    next(error);
  }
};

// GET RECOMMENDATIONS
const getRecommendations = async (req, res, next) => {
  try {
    // Get active scholarships
    const scholarships = await Scholarship.find({ isActive: true })
      .populate("scholar")
      .limit(5)
      .sort("-createdAt");

    // Get active internships
    const internships = await Internship.find()
      .limit(5)
      .sort("-createdAt");

    // Get active assessments
    const assessments = await Assessment.find({ status: "active" })
      .limit(5)
      .sort("-createdAt");

    res.status(200).json(
      createSuccessResponse({
        scholarships,
        internships,
        assessments,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRecommendations,
};
