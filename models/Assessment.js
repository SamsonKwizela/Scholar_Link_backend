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
    instructions: {
      type: String,
      default: '',
    },
    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
    timeLimit: {
      type: Number, // in minutes
      min: 1,
      default: 30,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
      default: 100,
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
      default: 50,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    publishedAt: {
      type: Date,
    },
    deadline: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

assessmentSchema.index({ status: 1, deadline: 1 });
assessmentSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);