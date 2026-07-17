const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    questionType: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'short_answer'],
      required: true,
    },
    options: [
      {
        label: {
          type: String,
          enum: ['A', 'B', 'C', 'D'],
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    explanation: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ assessment: 1, order: 1 });

module.exports = mongoose.model('Question', questionSchema);