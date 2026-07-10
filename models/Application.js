const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scholarship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scholarship',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ student: 1, scholarship: 1 }, { unique: true });
applicationSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
