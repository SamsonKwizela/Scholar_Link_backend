const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./models/user');
const axios = require('axios');

dotenv.config();

const API_BASE = 'http://localhost:8000/api';

const testEmailPreferencesEndpoints = async () => {
  try {
    // Connect to MongoDB
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

    // Test 1: GET email preferences (should return defaults)
    console.log('\n--- Test 1: GET /api/users/email-preferences ---');
    try {
      const getResponse = await axios.get(`${API_BASE}/users/email-preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✓ GET request successful');
      console.log('Response:', JSON.stringify(getResponse.data, null, 2));

      if (getResponse.data.success && getResponse.data.emailPreferences) {
        console.log('✓ Email preferences returned successfully');
        console.log('  - Scholarship notifications:', getResponse.data.emailPreferences.scholarshipNotifications);
        console.log('  - Internship notifications:', getResponse.data.emailPreferences.internshipNotifications);
        console.log('  - Deadline reminders:', getResponse.data.emailPreferences.deadlineReminders);
        console.log('  - Application updates:', getResponse.data.emailPreferences.applicationUpdates);
        console.log('  - Admin messages:', getResponse.data.emailPreferences.adminMessages);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('✗ GET request failed:', error.response?.data || error.message);
      throw error;
    }

    // Test 2: PUT email preferences
    console.log('\n--- Test 2: PUT /api/users/email-preferences ---');
    try {
      const newPreferences = {
        scholarshipNotifications: true,
        internshipNotifications: false,
        deadlineReminders: true,
        applicationUpdates: false,
        adminMessages: true
      };

      const putResponse = await axios.put(
        `${API_BASE}/users/email-preferences`,
        newPreferences,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✓ PUT request successful');
      console.log('Response:', JSON.stringify(putResponse.data, null, 2));

      if (putResponse.data.success && putResponse.data.emailPreferences) {
        console.log('✓ Email preferences updated successfully');
        console.log('  - Scholarship notifications:', putResponse.data.emailPreferences.scholarshipNotifications);
        console.log('  - Internship notifications:', putResponse.data.emailPreferences.internshipNotifications);
        console.log('  - Deadline reminders:', putResponse.data.emailPreferences.deadlineReminders);
        console.log('  - Application updates:', putResponse.data.emailPreferences.applicationUpdates);
        console.log('  - Admin messages:', putResponse.data.emailPreferences.adminMessages);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('✗ PUT request failed:', error.response?.data || error.message);
      throw error;
    }

    // Test 3: Verify preferences were saved in database
    console.log('\n--- Test 3: Verify preferences in database ---');
    const updatedUser = await User.findById(user._id);
    console.log('✓ User retrieved from database');
    console.log('  Email preferences:', updatedUser.emailPreferences);

    if (updatedUser.emailPreferences.internshipNotifications === false &&
        updatedUser.emailPreferences.applicationUpdates === false) {
      console.log('✓ Preferences correctly saved in database');
    } else {
      throw new Error('Preferences not saved correctly');
    }

    // Test 4: Test with invalid data (non-boolean values)
    console.log('\n--- Test 4: PUT with invalid data (should fail) ---');
    try {
      const invalidResponse = await axios.put(
        `${API_BASE}/users/email-preferences`,
        {
          scholarshipNotifications: 'true', // String instead of boolean
          internshipNotifications: 123 // Number instead of boolean
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.error('✗ Should have returned 400 error but got:', invalidResponse.status);
      throw new Error('Should have rejected non-boolean values');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✓ Correctly rejected non-boolean values');
        console.log('  Error message:', error.response.data.message);
      } else {
        console.error('✗ Unexpected error:', error.response?.data || error.message);
        throw error;
      }
    }

    // Test 5: Test without authentication
    console.log('\n--- Test 5: GET without authentication (should fail) ---');
    try {
      const noAuthResponse = await axios.get(`${API_BASE}/users/email-preferences`);
      console.error('✗ Should have returned 401 error but got:', noAuthResponse.status);
      throw new Error('Should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✓ Correctly requires authentication');
      } else {
        console.error('✗ Unexpected error:', error.response?.data || error.message);
        throw error;
      }
    }

    // Clean up
    await User.findByIdAndDelete(user._id);
    console.log('\n✓ Test user cleaned up');

    await mongoose.connection.close();
    console.log('✓ Database connection closed');

    console.log('\n✓✓✓ All tests passed! The API endpoints are working correctly. ✓✓✓');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error('Stack:', error.stack);
    
    try {
      await mongoose.connection.close();
    } catch (e) {
      // Ignore close errors
    }
    
    process.exit(1);
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    await axios.get(`${API_BASE}/health`).catch(() => {
      // Health endpoint might not exist, that's okay
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Main execution
checkServer().then(isRunning => {
  if (!isRunning) {
    console.log('⚠ Warning: Server might not be running on port 8000');
    console.log('  Make sure to start the server with: npm start or node server.js\n');
  }
  
  testEmailPreferencesEndpoints();
});