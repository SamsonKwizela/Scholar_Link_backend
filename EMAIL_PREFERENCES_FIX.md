# Email Preferences API - 500 Error Fix

## Problem
PUT /api/users/email-preferences was returning 500 Internal Server Error

## Root Cause
The controller file was using ES6 `export` syntax but the file was being imported using CommonJS `require()`. This caused the controller functions to be undefined, leading to errors when trying to call them.

## Solution

### 1. Fixed Controller File (`controllers/userController.js`)

**Changed from:**
```javascript
export const getProfile = async (req, res) => {
  // ...
};
```

**Changed to:**
```javascript
const getProfile = async (req, res) => {
  // ...
};

module.exports = {
  getProfile,
  updateProfile,
  updateEmailPreferences,
  registerUser,
};
```

### 2. Enhanced Error Handling

Added comprehensive logging and validation:

```javascript
const updateEmailPreferences = async (req, res) => {
  try {
    // Logging for debugging
    console.log("updateEmailPreferences called");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);

    // Validate request body fields
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

    // Check authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Update preferences with Boolean conversion
    if (scholarshipNotifications !== undefined) {
      user.emailPreferences.scholarshipNotifications = Boolean(scholarshipNotifications);
    }
    // ... other preferences

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Email preferences updated successfully",
      emailPreferences: updatedUser.emailPreferences,
    });
  } catch (error) {
    console.error("Error updating email preferences:", error);
    res.status(500).json({
      success: false,
      message: "Error updating email preferences: " + error.message,
    });
  }
};
```

## Files Modified

### 1. `controllers/userController.js`
- Converted from ES6 `export` to CommonJS `module.exports`
- Added comprehensive error logging
- Added request body validation
- Added authentication checks
- Added Boolean conversion for preference values
- Added meaningful error messages

### 2. `routes/userRoutes.js` (Already Correct)
```javascript
const express = require("express");
const { protect } = require("../middleware/auth");
const { getProfile, updateProfile, updateEmailPreferences } = require("../controllers/userController");

const router = express.Router();

router.put("/email-preferences", protect, updateEmailPreferences);

module.exports = router;
```

### 3. `server.js` (Already Correct)
```javascript
app.use("/api/users", userRoutes);
```

### 4. `models/user.js` (Already Correct)
```javascript
emailPreferences: {
  scholarshipNotifications: { type: Boolean, default: true },
  internshipNotifications: { type: Boolean, default: true },
  deadlineReminders: { type: Boolean, default: true },
  applicationUpdates: { type: Boolean, default: true },
  adminMessages: { type: Boolean, default: true }
}
```

### 5. `middleware/auth.js` (Already Correct)
- JWT middleware correctly attaches user to `req.user`
- Removes password from user object
- Handles both User and Admin models

## Testing

### Automated Test Results
```
✓ Connected to MongoDB
✓ Test user created
✓ JWT token generated
✓ User found
✓ Current preferences retrieved
✓ New preferences set
✓ User saved successfully
✓ Response Status: 200
✓ Response Data: {
  "success": true,
  "message": "Email preferences updated successfully",
  "emailPreferences": {
    "scholarshipNotifications": true,
    "internshipNotifications": false,
    "deadlineReminders": true,
    "applicationUpdates": false,
    "adminMessages": true
  }
}
✓ Verification - Preferences in database
✓ All tests passed!
```

### Manual Testing with cURL

```bash
# First, login to get JWT token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Use the token to update email preferences
curl -X PUT http://localhost:8000/api/users/email-preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scholarshipNotifications": true,
    "internshipNotifications": true,
    "deadlineReminders": true,
    "applicationUpdates": true,
    "adminMessages": true
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": "Email preferences updated successfully",
  "emailPreferences": {
    "scholarshipNotifications": true,
    "internshipNotifications": true,
    "deadlineReminders": true,
    "applicationUpdates": true,
    "adminMessages": true
  }
}
```

## Key Changes Explained

### 1. Module System Fix
The main issue was mixing ES6 modules with CommonJS. The controller file now uses `module.exports` which is compatible with the `require()` statements in routes.

### 2. Enhanced Validation
- Validates that only allowed fields are in the request body
- Returns 400 error with specific invalid field names
- Converts all values to Boolean to ensure type safety

### 3. Better Error Messages
- Specific error messages for different failure scenarios
- Console logging for debugging
- Stack traces in development mode

### 4. Authentication Verification
- Explicitly checks for `req.user` existence
- Verifies `req.user._id` is present
- Returns 401 if not authenticated

## Verification Checklist

- [x] Controller uses CommonJS module.exports
- [x] Route correctly imports controller functions
- [x] Route is registered in server.js
- [x] JWT middleware attaches user to req.user
- [x] User model has emailPreferences field
- [x] Controller validates request body
- [x] Controller checks authentication
- [x] Controller updates preferences correctly
- [x] Controller returns meaningful responses
- [x] Error handling is comprehensive
- [x] Test passes successfully

## Frontend Integration

The frontend should now work without errors:

```javascript
const response = await fetch('http://localhost:8000/api/users/email-preferences', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    scholarshipNotifications: true,
    internshipNotifications: true,
    deadlineReminders: true,
    applicationUpdates: true,
    adminMessages: true,
  }),
});

const data = await response.json();
console.log(data);
```

## Troubleshooting

If you still encounter issues:

1. **Check server logs**: The controller now logs detailed information
2. **Verify JWT token**: Ensure token is valid and not expired
3. **Check request headers**: Authorization header must be present
4. **Verify request body**: All fields must be boolean values
5. **Check MongoDB connection**: Ensure database is running

## Related Files

- `controllers/userController.js` - Fixed controller with proper exports
- `routes/userRoutes.js` - Route definition
- `server.js` - Route registration
- `middleware/auth.js` - JWT authentication
- `models/user.js` - User model with emailPreferences
- `test_email_preferences_api.js` - Comprehensive test script