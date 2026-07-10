const Assessment = require('../models/Assessment');
const AppError = require('../utils/appError');
const { createSuccessResponse, buildPaginationMeta } = require('../utils/response');

const createAssessment = async (req, res, next) => {
  try {
    const { title, description, questions, deadline, status } = req.body;

    if (!title || !description || !deadline) {
      return next(new AppError('Title, description, and deadline are required', 400));
    }

    const assessment = await Assessment.create({ title, description, questions, deadline, status });
    res.status(201).json(createSuccessResponse({ assessment }));
  } catch (error) {
    next(error);
  }
};

const getAssessments = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const search = req.query.search || '';
    const status = req.query.status || '';

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;

    const [totalItems, assessments] = await Promise.all([
      Assessment.countDocuments(filter),
      Assessment.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).lean(),
    ]);

    res.status(200).json(createSuccessResponse({
      assessments,
      pagination: buildPaginationMeta(page, limit, totalItems),
    }));
  } catch (error) {
    next(error);
  }
};

const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id).lean();

    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    res.status(200).json(createSuccessResponse({ assessment }));
  } catch (error) {
    next(error);
  }
};

const updateAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    Object.assign(assessment, req.body);
    const updatedAssessment = await assessment.save();

    res.status(200).json(createSuccessResponse({ assessment: updatedAssessment }));
  } catch (error) {
    next(error);
  }
};

const deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    res.status(200).json(createSuccessResponse({ message: 'Assessment deleted successfully' }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
};
