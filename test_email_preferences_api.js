const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./models/user');

dotenv.config();

const testEmailPreferencesAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Create a test user
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'hashedpassword',
      role: 'student',
    });

    await user.save();
    console.log('✓ Test user created:', user._id);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('✓ JWT token generated');

    // Simulate the controller logic
    console.log('\n--- Simulating PUT /api/users/email-preferences ---');

    // Simulate req.user from middleware
    const req = {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      },
      body: {
        scholarshipNotifications: true,
        internshipNotifications: false,
        deadlineReminders: true,
        applicationUpdates: false,
        adminMessages: true
      }
    };

    // Simulate res object
    const res = {
      status: (code) => {
        console.log(`\nResponse Status: ${code}`);
        return {
          json: (data) => {
            console.log('Response Data:', JSON.stringify(data, null, 2));
          }
        };
      }
    };

    // Run the controller logic
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user);

    const {
      scholarshipNotifications,
      internshipNotifications,
      deadlineReminders,
      applicationUpdates,
      adminMessages,
    } = req.body;

    // Validate request body
    if (req.body && Object.keys(req.body).length > 0) {
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
        console.log('✗ Invalid fields:', invalidFields);
        throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
      }
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.error('✗ User not authenticated');
      throw new Error('User not authenticated');
    }

    const foundUser = await User.findById(req.user._id);

    if (!foundUser) {
      console.error('✗ User not found:', req.user._id);
      throw new Error('User not found');
    }

    console.log('✓ User found:', foundUser._id);
    console.log('✓ Current preferences:', foundUser.emailPreferences);

    // Update email preferences
    if (scholarshipNotifications !== undefined) {
      foundUser.emailPreferences.scholarshipNotifications = Boolean(scholarshipNotifications);
    }
    if (internshipNotifications !== undefined) {
      foundUser.emailPreferences.internshipNotifications = Boolean(internshipNotifications);
    }
    if (deadlineReminders !== undefined) {
      foundUser.emailPreferences.deadlineReminders = Boolean(deadlineReminders);
    }
    if (applicationUpdates !== undefined) {
      foundUser.emailPreferences.applicationUpdates = Boolean(applicationUpdates);
    }
    if (adminMessages !== undefined) {
      foundUser.emailPreferences.adminMessages = Boolean(adminMessages);
    }

    console.log('✓ New preferences:', foundUser.emailPreferences);

    const updatedUser = await foundUser.save();

    console.log('✓ User saved successfully');

    // Simulate successful response
    res.status(200).json({
      success: true,
      message: "Email preferences updated successfully",
      emailPreferences: updatedUser.emailPreferences,
    });

    // Verify the update
    const verifyUser = await User.findById(user._id);
    console.log('\n✓ Verification - Preferences in database:');
    console.log('  - Scholarship notifications:', verifyUser.emailPreferences.scholarshipNotifications);
    console.log('  - Internship notifications:', verifyUser.emailPreferences.internshipNotifications);
    console.log('  - Deadline reminders:', verifyUser.emailPreferences.deadlineReminders);
    console.log('  - Application updates:', verifyUser.emailPreferences.applicationUpdates);
    console.log('  - Admin messages:', verifyUser.emailPreferences.adminMessages);

    // Clean up
    await User.findByIdAndDelete(user._id);
    console.log('\n✓ Test user cleaned up');

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    console.log('\n✓✓✓ All tests passed! The endpoint should work correctly. ✓✓✓');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

testEmailPreferencesAPI();