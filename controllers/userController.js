const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET USER PROFILE
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      message: "Profile fetched successfully",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE USER PROFILE
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET EMAIL PREFERENCES
const getEmailPreferences = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return email preferences (will use defaults from schema if not set)
    res.status(200).json({
      success: true,
      emailPreferences: user.emailPreferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching email preferences: " + error.message,
    });
  }
};

// UPDATE EMAIL PREFERENCES
const updateEmailPreferences = async (req, res) => {
  try {
    const {
      scholarshipNotifications,
      internshipNotifications,
      deadlineReminders,
      applicationUpdates,
      adminMessages,
    } = req.body;

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const validFields = [
      'scholarshipNotifications',
      'internshipNotifications',
      'deadlineReminders',
      'applicationUpdates',
      'adminMessages'
    ];

    const invalidFields = Object.keys(req.body).filter(
      field => !validFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${invalidFields.join(', ')}`,
      });
    }

    // Validate that all provided values are booleans
    const booleanFields = [scholarshipNotifications, internshipNotifications, deadlineReminders, applicationUpdates, adminMessages];
    const nonBooleanFields = booleanFields.filter(value => value !== undefined && typeof value !== 'boolean');
    
    if (nonBooleanFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All preference values must be boolean (true or false)",
      });
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update email preferences
    if (scholarshipNotifications !== undefined) {
      user.emailPreferences.scholarshipNotifications = scholarshipNotifications;
    }
    if (internshipNotifications !== undefined) {
      user.emailPreferences.internshipNotifications = internshipNotifications;
    }
    if (deadlineReminders !== undefined) {
      user.emailPreferences.deadlineReminders = deadlineReminders;
    }
    if (applicationUpdates !== undefined) {
      user.emailPreferences.applicationUpdates = applicationUpdates;
    }
    if (adminMessages !== undefined) {
      user.emailPreferences.adminMessages = adminMessages;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Email preferences updated successfully",
      emailPreferences: updatedUser.emailPreferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating email preferences: " + error.message,
    });
  }
};

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getEmailPreferences,
  updateEmailPreferences,
  registerUser,
};
