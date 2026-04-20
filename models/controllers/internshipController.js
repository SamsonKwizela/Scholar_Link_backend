const Internship = require('../models/Internship');

// CREATE INTERNSHIP
const createInternship = async (req, res) => {
  try {
    const internship = await Internship.create(req.body);
    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL INTERNSHIPS
const getInternships = async (req, res) => {
  const internships = await Internship.find();
  res.json(internships);
};

// DELETE INTERNSHIP
const deleteInternship = async (req, res) => {
  await Internship.findByIdAndDelete(req.params.id);
  res.json({ message: 'Internship deleted' });
};

module.exports = {
  createInternship,
  getInternships,
  deleteInternship,
};