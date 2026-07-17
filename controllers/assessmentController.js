const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { createSuccessResponse, buildPaginationMeta } = require('../utils/response');

// ==================== ASSESSMENT CRUD ====================

const createAssessment = async (req, res, next) => {
  try {
    const { title, description, instructions, timeLimit, totalMarks, passingScore, deadline } = req.body;

    if (!title || !description || !deadline) {
      return next(new AppError('Title, description, and deadline are required', 400));
    }

    const assessment = await Assessment.create({
      title,
      description,
      instructions: instructions || '',
      timeLimit: timeLimit || 30,
      totalMarks: totalMarks || 100,
      passingScore: passingScore || 50,
      deadline,
      createdBy: req.user._id,
      status: 'draft',
    });

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
      Assessment.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
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
    const assessment = await Assessment.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .lean();

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

    // Prevent updating published assessments
    if (assessment.status === 'published') {
      return next(new AppError('Cannot update published assessment', 400));
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
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    // Delete all questions associated with this assessment
    await Question.deleteMany({ assessment: req.params.id });

    await Assessment.findByIdAndDelete(req.params.id);

    res.status(200).json(createSuccessResponse({ message: 'Assessment deleted successfully' }));
  } catch (error) {
    next(error);
  }
};

const publishAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    if (assessment.status === 'published') {
      return next(new AppError('Assessment is already published', 400));
    }

    // Validate assessment has questions
    const questionCount = await Question.countDocuments({ assessment: req.params.id });
    if (questionCount === 0) {
      return next(new AppError('Cannot publish assessment without questions', 400));
    }

    assessment.status = 'published';
    assessment.publishedAt = new Date();
    await assessment.save();

    res.status(200).json(createSuccessResponse({ 
      message: 'Assessment published successfully',
      assessment 
    }));
  } catch (error) {
    next(error);
  }
};

const closeAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    assessment.status = 'closed';
    await assessment.save();

    res.status(200).json(createSuccessResponse({ 
      message: 'Assessment closed successfully',
      assessment 
    }));
  } catch (error) {
    next(error);
  }
};

// ==================== QUESTION MANAGEMENT ====================

const addQuestion = async (req, res, next) => {
  try {
    const { questionText, questionType, options, correctAnswer, marks, explanation } = req.body;
    const assessmentId = req.params.id;

    // Validate assessment ID
    if (!assessmentId) {
      return next(new AppError('Assessment ID is required', 400));
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    if (assessment.status === 'published') {
      return next(new AppError('Cannot add questions to published assessment', 400));
    }

    // Get the next order number
    const lastQuestion = await Question.findOne({ assessment: assessmentId })
      .sort('-order')
      .lean();
    const nextOrder = lastQuestion ? lastQuestion.order + 1 : 1;

    // Validate options for multiple choice
    if (questionType === 'multiple_choice') {
      if (!options || options.length < 2) {
        return next(new AppError('Multiple choice questions must have at least 2 options', 400));
      }
    }

    const question = await Question.create({
      assessment: assessmentId,
      questionText,
      questionType,
      options: options || [],
      correctAnswer,
      marks: marks || 1,
      explanation: explanation || '',
      order: nextOrder,
    });

    res.status(201).json(createSuccessResponse({ question }));
  } catch (error) {
    next(error);
  }
};

const getQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ assessment: req.params.id })
      .sort('order')
      .lean();

    res.status(200).json(createSuccessResponse({ questions }));
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    // Check if assessment is published
    const assessment = await Assessment.findById(question.assessment);
    if (assessment && assessment.status === 'published') {
      return next(new AppError('Cannot update questions in published assessment', 400));
    }

    Object.assign(question, req.body);
    await question.save();

    res.status(200).json(createSuccessResponse({ question }));
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    // Check if assessment is published
    const assessment = await Assessment.findById(question.assessment);
    if (assessment && assessment.status === 'published') {
      return next(new AppError('Cannot delete questions from published assessment', 400));
    }

    await Question.findByIdAndDelete(req.params.questionId);

    // Reorder remaining questions
    await Question.find({ assessment: question.assessment })
      .sort('order')
      .forEach((q, index) => {
        q.order = index + 1;
        q.save();
      });

    res.status(200).json(createSuccessResponse({ message: 'Question deleted successfully' }));
  } catch (error) {
    next(error);
  }
};

// ==================== ASSESSMENT SENDING ====================

const sendAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    if (assessment.status !== 'published') {
      return next(new AppError('Only published assessments can be sent', 400));
    }

    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return next(new AppError('Please select at least one user', 400));
    }

    // Validate users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return next(new AppError('Some users not found', 404));
    }

    // Add users to targetUsers if not already there
    const newTargetUsers = userIds.filter(
      userId => !assessment.targetUsers.includes(userId)
    );
    
    assessment.targetUsers = [...assessment.targetUsers, ...newTargetUsers];
    await assessment.save();

    res.status(200).json(createSuccessResponse({ 
      message: `Assessment sent to ${newTargetUsers.length} user(s) successfully`,
      sentCount: newTargetUsers.length 
    }));
  } catch (error) {
    next(error);
  }
};

// ==================== USER ASSESSMENT SUBMISSION ====================

const getUserAssessments = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find assessments assigned to the user
    const assessments = await Assessment.find({
      status: 'published',
      deadline: { $gte: new Date() },
      $or: [
        { targetUsers: userId },
        { targetUsers: { $size: 0 } }, // Assessments with no specific targets
      ],
    })
      .populate('createdBy', 'firstName lastName')
      .lean();

    res.status(200).json(createSuccessResponse({ assessments }));
  } catch (error) {
    next(error);
  }
};

const submitAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    if (assessment.status !== 'published') {
      return next(new AppError('This assessment is not available for submission', 400));
    }

    if (new Date() > assessment.deadline) {
      return next(new AppError('Assessment deadline has passed', 400));
    }

    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return next(new AppError('Answers are required', 400));
    }

    // Get all questions for this assessment
    const questions = await Question.find({ assessment: req.params.id }).lean();

    if (questions.length === 0) {
      return next(new AppError('Assessment has no questions', 400));
    }

    // Calculate score
    let totalScore = 0;
    const results = answers.map((answer, index) => {
      const question = questions[index];
      const isCorrect = answer === question.correctAnswer;
      if (isCorrect) {
        totalScore += question.marks;
      }
      return {
        questionId: question._id,
        userAnswer: answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        marks: isCorrect ? question.marks : 0,
      };
    });

    const passed = totalScore >= assessment.passingScore;

    const submission = {
      assessmentId: assessment._id,
      userId: req.user._id,
      answers: results,
      totalScore,
      totalMarks: assessment.totalMarks,
      passed,
      submittedAt: new Date(),
    };

    // In a real application, you would save this to a Submission model
    // For now, we'll return it in the response
    res.status(200).json(createSuccessResponse({ 
      message: 'Assessment submitted successfully',
      submission 
    }));
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
  publishAssessment,
  closeAssessment,
  addQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  sendAssessment,
  getUserAssessments,
  submitAssessment,
};