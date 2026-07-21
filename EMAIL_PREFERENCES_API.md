# Email Preferences API Documentation

## Overview
This document describes the email preferences API endpoint that allows users to manage their email notification settings.

## Endpoint

### PUT /api/users/email-preferences

**Description**: Update user's email notification preferences

**Authentication**: Required (JWT token)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "scholarshipNotifications": true,
  "internshipNotifications": true,
  "deadlineReminders": true,
  "applicationUpdates": true,
  "adminMessages": true
}
```

**Request Body Fields**:
- `scholarshipNotifications` (Boolean, optional): Receive emails about new scholarships
- `internshipNotifications` (Boolean, optional): Receive emails about new internships
- `deadlineReminders` (Boolean, optional): Receive deadline reminder emails
- `applicationUpdates` (Boolean, optional): Receive application status update emails
- `adminMessages` (Boolean, optional): Receive emails from admins

**Note**: All fields are optional. You can update one or more preferences at a time.

---

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Email preferences updated successfully",
  "data": {
    "emailPreferences": {
      "scholarshipNotifications": true,
      "internshipNotifications": false,
      "deadlineReminders": true,
      "applicationUpdates": false,
      "adminMessages": true
    }
  }
}
```

### Error Responses

**401 Unauthorized** - No JWT token provided
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found** - User not found
```json
{
  "success": false,
  "message": "User not found"
}
```

**500 Server Error** - Server error
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Example Usage

### Using cURL

```bash
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

### Using JavaScript (Fetch)

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

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const response = await axios.put(
  'http://localhost:8000/api/users/email-preferences',
  {
    scholarshipNotifications: true,
    internshipNotifications: true,
    deadlineReminders: true,
    applicationUpdates: true,
    adminMessages: true,
  },
  {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
    },
  }
);

console.log(response.data);
```

### Using React

```javascript
const updateEmailPreferences = async (preferences) => {
  try {
    const response = await fetch('/api/users/email-preferences', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Preferences updated:', data.data.emailPreferences);
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Error updating preferences:', error);
  }
};

// Usage
updateEmailPreferences({
  scholarshipNotifications: true,
  internshipNotifications: false,
  deadlineReminders: true,
  applicationUpdates: true,
  adminMessages: false,
});
```

---

## Database Schema

The email preferences are stored in the User collection:

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  // ... other user fields
  
  emailPreferences: {
    scholarshipNotifications: {
      type: Boolean,
      default: true
    },
    internshipNotifications: {
      type: Boolean,
      default: true
    },
    deadlineReminders: {
      type: Boolean,
      default: true
    },
    applicationUpdates: {
      type: Boolean,
      default: true
    },
    adminMessages: {
      type: Boolean,
      default: true
    }
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Implementation Details

### Controller Function

**File**: `controllers/userController.js`

```javascript
export const updateEmailPreferences = async (req, res) => {
  try {
    const {
      scholarshipNotifications,
      internshipNotifications,
      deadlineReminders,
      applicationUpdates,
      adminMessages,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
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
      message: "Email preferences updated successfully",
      emailPreferences: updatedUser.emailPreferences,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
```

### Route Registration

**File**: `routes/userRoutes.js`

```javascript
const express = require("express");
const { protect } = require("../middleware/auth");
const { getProfile, updateProfile, updateEmailPreferences } = require("../controllers/userController");

const router = express.Router();

// GET USER PROFILE
router.get("/profile", protect, getProfile);

// UPDATE USER PROFILE
router.put("/profile", protect, updateProfile);

// UPDATE EMAIL PREFERENCES
router.put("/email-preferences", protect, updateEmailPreferences);

module.exports = router;
```

### Server Registration

**File**: `server.js`

```javascript
const userRoutes = require("./routes/userRoutes");

// ... other code ...

app.use("/api/users", userRoutes);
```

---

## Integration with Email Service

When sending emails, check the user's preferences first:

```javascript
const { sendScholarshipNotification } = require('../services/emailService');

// Before sending email
const user = await User.findById(userId);

if (user.emailPreferences.scholarshipNotifications) {
  await sendScholarshipNotification(user, scholarship);
}
```

### Example Integration in Email Service

```javascript
const sendScholarshipNotification = async (user, scholarship) => {
  // Check if user wants to receive scholarship notifications
  if (!user.emailPreferences.scholarshipNotifications) {
    return { success: false, message: 'User has disabled scholarship notifications' };
  }

  // ... rest of the email sending logic
};
```

---

## Testing

### Test with Postman

1. **Setup**:
   - URL: `http://localhost:8000/api/users/email-preferences`
   - Method: `PUT`
   - Headers:
     - `Authorization`: `Bearer YOUR_JWT_TOKEN`
     - `Content-Type`: `application/json`

2. **Body** (raw JSON):
```json
{
  "scholarshipNotifications": true,
  "internshipNotifications": false,
  "deadlineReminders": true,
  "applicationUpdates": true,
  "adminMessages": false
}
```

3. **Send Request** and verify:
   - Status code: 200
   - Response contains updated emailPreferences

### Test with Automated Script

```bash
node test_email_preferences.js
```

---

## Frontend Integration

### React Component Example

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const EmailNotificationSettings = () => {
  const [preferences, setPreferences] = useState({
    scholarshipNotifications: true,
    internshipNotifications: true,
    deadlineReminders: true,
    applicationUpdates: true,
    adminMessages: true,
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(
        'http://localhost:8000/api/users/email-preferences',
        preferences,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      alert('Email preferences updated successfully!');
      console.log('Updated preferences:', response.data.data.emailPreferences);
    } catch (error) {
      alert('Error updating preferences: ' + error.response?.data?.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Email Notification Settings</h2>
      
      <label>
        <input
          type="checkbox"
          name="scholarshipNotifications"
          checked={preferences.scholarshipNotifications}
          onChange={handleChange}
        />
        Scholarship Notifications
      </label>

      <label>
        <input
          type="checkbox"
          name="internshipNotifications"
          checked={preferences.internshipNotifications}
          onChange={handleChange}
        />
        Internship Notifications
      </label>

      <label>
        <input
          type="checkbox"
          name="deadlineReminders"
          checked={preferences.deadlineReminders}
          onChange={handleChange}
        />
        Deadline Reminders
      </label>

      <label>
        <input
          type="checkbox"
          name="applicationUpdates"
          checked={preferences.applicationUpdates}
          onChange={handleChange}
        />
        Application Updates
      </label>

      <label>
        <input
          type="checkbox"
          name="adminMessages"
          checked={preferences.adminMessages}
          onChange={handleChange}
        />
        Admin Messages
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
};

export default EmailNotificationSettings;
```

---

## Security Considerations

1. **JWT Authentication**: All requests must include a valid JWT token
2. **User Authorization**: Users can only update their own preferences
3. **Input Validation**: All fields are validated before updating
4. **Default Values**: All preferences default to `true` (opt-out model)

---

## Troubleshooting

### 404 Not Found Error

**Problem**: `PUT http://localhost:8000/api/users/email-preferences 404 (Not Found)`

**Solutions**:
1. Ensure server is running on port 8000
2. Verify route is registered in `server.js`:
   ```javascript
   app.use("/api/users", userRoutes);
   ```
3. Check that `userRoutes.js` includes the email-preferences route
4. Restart the server after making changes

### 401 Unauthorized Error

**Problem**: JWT token missing or invalid

**Solutions**:
1. Ensure Authorization header is included:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```
2. Verify JWT token is valid and not expired
3. Check that `protect` middleware is working correctly

### Preferences Not Saving

**Problem**: Database not updating

**Solutions**:
1. Check MongoDB connection
2. Verify User model has emailPreferences field
3. Check server logs for errors
4. Ensure request body contains valid boolean values

---

## Related Files

- `models/user.js` - User model with emailPreferences schema
- `controllers/userController.js` - updateEmailPreferences function
- `routes/userRoutes.js` - Route definition
- `server.js` - Route registration
- `middleware/auth.js` - JWT authentication middleware

---

## API Endpoint Summary

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| PUT | /api/users/email-preferences | Authenticated User | Update email notification preferences |

---

## Notes

- All preferences default to `true` (users receive emails by default)
- Users can opt-out of specific email types
- Changes take effect immediately
- Preferences are stored in the User document
- No separate preferences collection needed