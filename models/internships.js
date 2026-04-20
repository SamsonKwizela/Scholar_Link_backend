const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    duration: String,
    deadline: Date,
    description: String,
    requirements: String,
    benefits: String,
    idealCandidate: String,
    responsibilities: String,
    expectedOutcome: String,
    salary: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Internship', internshipSchema);