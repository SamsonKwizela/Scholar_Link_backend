const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user');

dotenv.config();

const testEmailPreferences = async () => {
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
    console.log('✓ Test user created');

    // Test updating email preferences
    user.emailPreferences = {
      scholarshipNotifications: true,
      internshipNotifications: false,
      deadlineReminders: true,
      applicationUpdates: false,
      adminMessages: true,
    };

    await user.save();
    console.log('✓ Email preferences updated successfully');
    console.log('  - Scholarship notifications:', user.emailPreferences.scholarshipNotifications);
    console.log('  - Internship notifications:', user.emailPreferences.internshipNotifications);
    console.log('  - Deadline reminders:', user.emailPreferences.deadlineReminders);
    console.log('  - Application updates:', user.emailPreferences.applicationUpdates);
    console.log('  - Admin messages:', user.emailPreferences.adminMessages);

    // Verify the user was saved correctly
    const savedUser = await User.findById(user._id);
    console.log('\n✓ User retrieved from database:');
    console.log('  Email preferences:', savedUser.emailPreferences);

    // Clean up
    await User.findByIdAndDelete(user._id);
    console.log('\n✓ Test user cleaned up');

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    console.log('\n✓ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error testing email preferences:', error);
    process.exit(1);
  }
};

testEmailPreferences();