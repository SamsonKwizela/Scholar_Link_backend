const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const {
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
} = require('../controllers/assessmentController');

const router = express.Router();

// ==================== ASSESSMENT ROUTES ====================

// GET ALL ASSESSMENTS (Public for users, Admin for all)
router.get('/', getAssessments);

// GET ASSESSMENT BY ID (Public)
router.get('/:id', getAssessmentById);

// CREATE ASSESSMENT (Admin only)
router.post('/', protect, authorizeRoles('admin'), createAssessment);

// UPDATE ASSESSMENT (Admin only)
router.put('/:id', protect, authorizeRoles('admin'), updateAssessment);

// DELETE ASSESSMENT (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), deleteAssessment);

// PUBLISH ASSESSMENT (Admin only)
router.patch('/:id/publish', protect, authorizeRoles('admin'), publishAssessment);

// CLOSE ASSESSMENT (Admin only)
router.patch('/:id/close', protect, authorizeRoles('admin'), closeAssessment);

// ==================== QUESTION ROUTES ====================

// ADD QUESTION TO ASSESSMENT (Admin only)
router.post('/:id/questions', protect, authorizeRoles('admin'), addQuestion);

// GET ALL QUESTIONS FOR ASSESSMENT (Public)
router.get('/:id/questions', getQuestions);

// UPDATE QUESTION (Admin only)
router.put('/questions/:questionId', protect, authorizeRoles('admin'), updateQuestion);

// DELETE QUESTION (Admin only)
router.delete('/questions/:questionId', protect, authorizeRoles('admin'), deleteQuestion);

// ==================== ASSESSMENT SENDING ====================

// SEND ASSESSMENT TO USERS (Admin only)
router.post('/:id/send', protect, authorizeRoles('admin'), sendAssessment);

// ==================== USER ASSESSMENT ROUTES ====================

// GET USER'S ASSIGNED ASSESSMENTS (Authenticated users)
router.get('/user/my-assessments', protect, getUserAssessments);

// SUBMIT ASSESSMENT (Authenticated users)
router.post('/:id/submit', protect, submitAssessment);

module.exports = router;