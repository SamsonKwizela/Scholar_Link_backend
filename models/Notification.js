const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ['application', 'system', 'scholarship', 'internship', 'deadline'],
      default: 'system',
    },

    emailSent: {
      type: Boolean,
      default: false,
    },

    read: {
      type: Boolean,
      default: false,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },

    relatedModel: {
      type: String,
      enum: ['Scholarship', 'Internship', 'Application'],
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ emailSent: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);