const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    opportunityType: {
      type: String,
      enum: ['scholarship', 'internship'],
      required: true,
    },

    applicantInformation: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },

    generatedFiles: {
      profilePDF: {
        type: String,
        default: null,
      },
      applicationFolder: {
        type: String,
        default: null,
      },
    },

    attachedDocuments: [
      {
        name: {
          type: String,
          required: true,
        },
        path: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
      },
    ],

    status: {
      type: String,
      enum: ['Pending', 'Reviewing', 'Accepted', 'Rejected'],
      default: 'Pending',
    },

    adminFeedback: {
      type: String,
      default: '',
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ userId: 1, opportunityId: 1, opportunityType: 1 }, { unique: true });
applicationSchema.index({ status: 1, submittedAt: -1 });
applicationSchema.index({ userId: 1, submittedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);