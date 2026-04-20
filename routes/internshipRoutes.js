const express = require('express');
const router = express.Router();

const {
  createInternship,
  getInternships,
  deleteInternship,
} = require('../controllers/internshipController');

router.post('/', createInternship);
router.get('/', getInternships);
router.delete('/:id', deleteInternship);

module.exports = router;
