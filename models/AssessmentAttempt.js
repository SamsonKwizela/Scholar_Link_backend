const mongoose = require('mongoose');

const assessmentAttemptSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        answer: { type: String, required: true },
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

assessmentAttemptSchema.index({ assessment: 1, user: 1, submittedAt: -1 });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);