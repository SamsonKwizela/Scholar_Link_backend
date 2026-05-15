const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    duration: { type: String, required: true },
    deadline: { type: Date, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    benefits: { type: String, required: true },
    idealCandidate: { type: String, required: true },
    responsibilities: { type: String, required: true },
    expectedOutcome: { type: String, required: true },
    salary: { type: Number, required: true }
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Internship', internshipSchema);