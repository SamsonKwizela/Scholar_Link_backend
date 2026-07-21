const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['sent', 'failed'],
      required: true,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },

    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emailLogSchema.index({ userId: 1, sentAt: -1 });
emailLogSchema.index({ email: 1, sentAt: -1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);