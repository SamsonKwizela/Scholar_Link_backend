const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    personalInfo: {
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
      university: {
        type: String,
        required: true,
      },
    },

    professionalProfile: {
      about: {
        type: String,
        default: '',
      },

      experience: [
        {
          title: {
            type: String,
            required: true,
          },
          company: {
            type: String,
            required: true,
          },
          duration: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
        },
      ],

      projects: [
        {
          name: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          technologies: {
            type: String,
            required: true,
          },
        },
      ],

      certifications: [
        {
          name: {
            type: String,
            required: true,
          },
          provider: {
            type: String,
            required: true,
          },
          year: {
            type: Number,
            required: true,
          },
        },
      ],

      skills: [
        {
          type: String,
        },
      ],

      interests: [
        {
          type: String,
        },
      ],

      socialLinks: {
        github: {
          type: String,
          default: '',
        },
        linkedin: {
          type: String,
          default: '',
        },
        portfolio: {
          type: String,
          default: '',
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.index({ userId: 1 });

module.exports = mongoose.model('Profile', profileSchema);