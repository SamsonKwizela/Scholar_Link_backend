const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
} = require('../controllers/assessmentController');

const router = express.Router();

// GET ALL ASSESSMENTS
router.get('/', getAssessments);

// GET ASSESSMENT BY ID
router.get('/:id', getAssessmentById);

// CREATE ASSESSMENT (Admin)
router.post('/', protect, authorizeRoles('admin'), createAssessment);

// UPDATE ASSESSMENT (Admin)
router.put('/:id', protect, authorizeRoles('admin'), updateAssessment);

// DELETE ASSESSMENT (Admin)
router.delete('/:id', protect, authorizeRoles('admin'), deleteAssessment);

module.exports = router;
