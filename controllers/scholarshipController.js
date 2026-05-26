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
    console.log("[createScholarship] received scholarId:", scholarId);
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

// GET ALL SCHOLARSHIPS
const getScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find().populate("scholar");

    res.status(200).json({
      message: "Scholarships fetched successfully",
      scholarships,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE SCHOLARSHIP
const updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found" });
    }

    const {
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

    scholarship.title = title ?? scholarship.title;
    scholarship.provider = provider ?? scholarship.provider;
    scholarship.description = description ?? scholarship.description;
    scholarship.category = category ?? scholarship.category;
    scholarship.level = level ?? scholarship.level;
    scholarship.location = location ?? scholarship.location;
    scholarship.requirements = requirements ?? scholarship.requirements;
    scholarship.benefits = benefits ?? scholarship.benefits;
    scholarship.deadline = deadline ?? scholarship.deadline;
    scholarship.applicationUrl = applicationUrl ?? scholarship.applicationUrl;
    scholarship.tags = tags ?? scholarship.tags;
    scholarship.isActive = isActive ?? scholarship.isActive;

    const updated = await scholarship.save();

    res.status(200).json({
      message: "Scholarship updated successfully",
      scholarship: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE SCHOLARSHIP
const deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found" });
    }

    res.status(200).json({ message: "Scholarship deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createScholarship,
  getScholarships,
  updateScholarship,
  deleteScholarship,
};
