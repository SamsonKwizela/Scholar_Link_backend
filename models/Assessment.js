const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    questions: [{ type: String, trim: true }],
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

assessmentSchema.index({ status: 1, deadline: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
