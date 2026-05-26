const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema(
  {
    scholar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scholar",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    provider: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      required: true,
    },

    location: {
      country: String,
      city: String,
    },

    requirements: [
      {
        type: String,
      },
    ],

    benefits: {
      tuition: String,
      monthlyStipend: Number,
      housing: Boolean,
    },

    deadline: {
      type: String,
    },

    applicationUrl: {
      type: String,
    },

    tags: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Scholarship", scholarshipSchema);
