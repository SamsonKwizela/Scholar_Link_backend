const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

const {
  createInternship,
  getInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
} = require('../controllers/internshipController');

// CREATE INTERNSHIP (Admin)
router.post('/', protect, authorizeRoles('admin'), createInternship);

// GET ALL INTERNSHIPS
router.get('/', getInternships);

// GET INTERNSHIP BY ID
router.get('/:id', getInternshipById);

// UPDATE INTERNSHIP (Admin)
router.put('/:id', protect, authorizeRoles('admin'), updateInternship);

// DELETE INTERNSHIP (Admin)
router.delete('/:id', protect, authorizeRoles('admin'), deleteInternship);

module.exports = router;
