const Scholar = require("../models/Scholar");

const createScholar = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    const scholar = await Scholar.create({
      name,
      description,
      category,
    });

    res.status(201).json({
      message: "Scholar created successfully",
      scholar,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getScholars = async (req, res) => {
  try {
    const scholars = await Scholar.find();

    res.status(200).json({
      message: "Scholars fetched successfully",
      scholars,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getScholarById = async (req, res) => {
  try {
    const scholar = await Scholar.findById(req.params.id);

    if (!scholar) {
      return res.status(404).json({
        message: "Scholar not found",
      });
    }

    res.status(200).json({
      message: "Scholar fetched successfully",
      scholar,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createScholar,
  getScholars,
  getScholarById,
};
