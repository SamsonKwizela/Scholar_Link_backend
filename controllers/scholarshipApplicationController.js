const ScholarshipApplication = require("../models/ScholarshipApplication");

const Scholarship = require("../models/Scholarship");

// APPLY FOR SCHOLARSHIP
const applyScholarship = async (req, res) => {
  try {
    const {
      scholarshipId,
      userId,
      fullName,
      email,
      phoneNumber,
      motivationLetter,
    } = req.body;

    // check scholarship exists
    const scholarship = await Scholarship.findById(scholarshipId);

    if (!scholarship) {
      return res.status(404).json({
        message: "Scholarship not found",
      });
    }

    // uploaded documents
    const documents = req.files.map((file) => file.path);

    // create application
    const application = await ScholarshipApplication.create({
      scholarship: scholarshipId,
      user: userId,
      fullName,
      email,
      phoneNumber,
      motivationLetter,
      documents,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  applyScholarship,
};
