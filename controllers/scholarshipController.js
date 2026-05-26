const Scholarship = require("../models/Scholarship");
const Scholar = require("../models/Scholar");

// CREATE SCHOLARSHIP
const createScholarship = async (req, res) => {
  try {
    const {
      scholarId,
      title,
      provider,
      description,
      category,
      level,
      location,
      requirements,
      benefits,
      deadline,
      applicationUrl,
      tags,
      isActive,
    } = req.body;

    // check scholar exists
    const scholar = await Scholar.findById(scholarId);

    if (!scholar) {
      return res.status(404).json({
        message: "Scholar not found",
      });
    }

    // create scholarship
    const scholarship = await Scholarship.create({
      scholar: scholarId,
      title,
      provider,
      description,
      category,
      level,
      location,
      requirements,
      benefits,
      deadline,
      applicationUrl,
      tags,
      isActive,
    });

    res.status(201).json({
      message: "Scholarship created successfully",
      scholarship,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createScholarship,
};
