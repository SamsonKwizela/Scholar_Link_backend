# ScholarLink Email Notification System

## Overview
This document describes the complete email notification system for the ScholarLink platform, including automatic notifications, deadline reminders, and manual email broadcasting.

## Technology Stack
- **Email Service**: Nodemailer
- **Scheduled Jobs**: node-cron
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT

---

## Architecture

### Components

1. **Email Service** (`services/emailService.js`)
   - Core email sending functionality
   - HTML email templates
   - Email logging

2. **Email Controller** (`controllers/emailController.js`)
   - API endpoints for email operations
   - Business logic for notifications

3. **Notification Routes** (`routes/notificationRoutes.js`)
   - RESTful API endpoints
   - Authentication and authorization

4. **Deadline Reminder Job** (`jobs/deadlineReminder.js`)
   - Automated deadline checking
   - Scheduled email reminders

5. **Models**
   - `EmailLog.js` - Email sending history
   - `Notification.js` - In-app notifications

---

## Email Service Functions

### 1. sendEmail()
**Purpose**: Generic email sending function

**Parameters**:
- `to` (String) - Recipient email address
- `subject` (String) - Email subject
- `htmlContent` (String) - HTML email body
- `userId` (ObjectId, optional) - User ID for logging

**Returns**: `{ success: Boolean, messageId: String, error: String }`

**Features**:
- SMTP configuration via environment variables
- Automatic email logging to EmailLog collection
- Error handling and logging

---

### 2. sendScholarshipNotification()
**Purpose**: Send notification when new scholarship is created

**Parameters**:
- `user` (User Object) - Recipient user
- `scholarship` (Scholarship Object) - Scholarship details

**Email Content**:
- Subject: "New Scholarship Opportunity Available"
- Scholarship title, provider, description
- Requirements and deadline
- Application link
- HTML formatted with green theme

**Creates**: Notification record with type 'scholarship'

---

### 3. sendInternshipNotification()
**Purpose**: Send notification when new internship is created

**Parameters**:
- `user` (User Object) - Recipient user
- `internship` (Internship Object) - Internship details

**Email Content**:
- Subject: "New Internship Opportunity Available"
- Internship title, company, location
- Description, requirements, duration
- Deadline and salary
- Application link
- HTML formatted with blue theme

**Creates**: Notification record with type 'internship'

---

### 4. sendDeadlineReminder()
**Purpose**: Send deadline reminder emails

**Parameters**:
- `user` (User Object) - Recipient user
- `opportunity` (Object) - Scholarship or Internship
- `type` (String) - 'scholarship' or 'internship'
- `daysRemaining` (Number) - Days until deadline

**Email Content**:
- Subject: "Reminder: X days left to apply for [Title]"
- Urgent deadline warning
- Opportunity details
- Apply now button
- HTML formatted with orange theme

**Creates**: Notification record with type 'deadline'

---

### 5. sendApplicationStatusEmail()
**Purpose**: Send application status updates

**Parameters**:
- `user` (User Object) - Recipient user
- `application` (Application Object) - Application details
- `status` (String) - 'Accepted', 'Rejected', or 'Reviewing'

**Email Content**:
- **Accepted**: Green theme, congratulatory message
- **Rejected**: Red theme, polite rejection message
- **Reviewing**: Blue theme, under review message
- Includes application ID and admin feedback

**Creates**: Notification record with type 'application'

---

### 6. sendAdminMessageEmail()
**Purpose**: Send admin feedback messages

**Parameters**:
- `user` (User Object) - Student recipient
- `admin` (User Object) - Admin sender
- `application` (Application Object) - Related application
- `messageText` (String) - Admin message

**Email Content**:
- Subject: "New Message From ScholarLink Admin"
- Admin message in styled box
- Application reference
- View application button
- HTML formatted with purple theme

**Creates**: Notification record with type 'system'

---

### 7. broadcastEmail()
**Purpose**: Send email to multiple users

**Parameters**:
- `users` (Array) - Array of user objects
- `subject` (String) - Email subject
- `htmlContent` (String) - HTML email body

**Returns**: Array of results for each user

**Use Case**: Admin announcements to all students

---

## Deadline Reminder Job

### Configuration
- **Schedule**: Daily at 8:00 AM
- **Cron Expression**: `0 8 * * *`
- **Reminder Intervals**: 7, 3, and 1 day before deadline

### Workflow

1. **On Server Startup**:
   - Connects to MongoDB
   - Runs initial deadline check
   - Schedules daily cron job

2. **Daily Execution**:
   - Checks scholarships with deadlines in 7, 3, and 1 days
   - Checks internships with deadlines in 7, 3, and 1 days
   - Sends reminders to all students

3. **Duplicate Prevention**:
   - Checks for existing notifications
   - Only sends if reminder not already sent
   - Uses regex pattern matching for days remaining

### Database Queries

```javascript
// Find scholarships ending in X days
Scholarship.find({
  deadline: {
    $gte: startOfDay,
    $lt: endOfDay
  },
  isActive: true
})

// Check if reminder already sent
Notification.findOne({
  userId: student._id,
  relatedId: opportunity._id,
  relatedModel: 'Scholarship',
  type: 'deadline',
  message: { $regex: `${daysRemaining} days remaining` }
})
```

---

## API Endpoints

### Student Endpoints

#### GET /api/notifications
**Description**: Retrieve all notifications for logged-in user

**Authentication**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "...",
        "userId": "...",
        "title": "New Scholarship Opportunity",
        "message": "...",
        "type": "scholarship",
        "emailSent": true,
        "read": false,
        "createdAt": "..."
      }
    ]
  }
}
```

---

#### GET /api/notifications/email-history
**Description**: Retrieve email sending history for logged-in user

**Authentication**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "data": {
    "emailLogs": [
      {
        "_id": "...",
        "userId": "...",
        "email": "student@example.com",
        "subject": "New Scholarship Opportunity",
        "status": "sent",
        "sentAt": "..."
      }
    ]
  }
}
```

---

#### PATCH /api/notifications/:id/read
**Description**: Mark notification as read

**Authentication**: Required (JWT)

**Parameters**:
- `id` (URL parameter) - Notification ID

**Response**:
```json
{
  "success": true,
  "data": {
    "notification": {
      "_id": "...",
      "read": true
    }
  }
}
```

---

### Admin Endpoints

#### POST /api/admin/email/broadcast
**Description**: Send broadcast email to all students

**Authentication**: Required (Admin JWT)

**Request Body**:
```json
{
  "subject": "Important Announcement",
  "message": "This is an important announcement for all students."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Broadcast completed. 150 emails sent, 0 failed.",
  "data": {
    "results": [
      {
        "userId": "...",
        "email": "student@example.com",
        "success": true
      }
    ]
  }
}
```

---

#### POST /api/admin/notifications/send
**Description**: Send manual notification to specific user

**Authentication**: Required (Admin JWT)

**Request Body**:
```json
{
  "userId": "user_id_here",
  "title": "Custom Notification",
  "message": "This is a custom notification message.",
  "type": "system",
  "sendEmail": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "notification": {
      "_id": "...",
      "userId": "...",
      "title": "Custom Notification",
      "emailSent": true
    },
    "emailSent": true
  }
}
```

---

#### POST /api/admin/notifications/scholarship
**Description**: Send scholarship notification to all students

**Authentication**: Required (Admin JWT)

**Request Body**:
```json
{
  "scholarshipId": "scholarship_id_here"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Scholarship notification sent. 150 emails sent, 0 failed.",
  "data": {
    "successCount": 150,
    "failCount": 0
  }
}
```

---

#### POST /api/admin/notifications/internship
**Description**: Send internship notification to all students

**Authentication**: Required (Admin JWT)

**Request Body**:
```json
{
  "internshipId": "internship_id_here"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Internship notification sent. 150 emails sent, 0 failed.",
  "data": {
    "successCount": 150,
    "failCount": 0
  }
}
```

---

## Database Schema

### EmailLog Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  email: String (required),
  subject: String (required),
  message: String (required),
  status: String (enum: ["sent", "failed"]),
  sentAt: Date (default: Date.now),
  error: String (default: null),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ userId: 1, sentAt: -1 }` - User email history
- `{ email: 1, sentAt: -1 }` - Email-based queries

---

### Notification Collection (Updated)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  title: String (required),
  message: String (required),
  type: String (enum: ["application", "system", "scholarship", "internship", "deadline"]),
  emailSent: Boolean (default: false),
  read: Boolean (default: false),
  relatedId: ObjectId (refPath: 'relatedModel'),
  relatedModel: String (enum: ["Scholarship", "Internship", "Application"]),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ userId: 1, createdAt: -1 }` - User notifications
- `{ emailSent: 1, createdAt: -1 }` - Email status tracking

---

## Environment Variables

### Required SMTP Configuration

```env
# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup Instructions

1. Enable 2-factor authentication on Gmail
2. Generate App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"
3. Use generated password in `SMTP_PASSWORD`

### Other SMTP Providers

**SendGrid**:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_EMAIL=your-sendgrid-email
SMTP_PASSWORD=your-sendgrid-api-key
```

**Mailgun**:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_EMAIL=your-mailgun-email
SMTP_PASSWORD=your-mailgun-password
```

---

## Email Templates

### Template Structure
All emails use HTML templates with:
- Responsive design (max-width: 600px)
- Professional styling
- Color-coded headers by type
- Call-to-action buttons
- Footer with copyright

### Template Types

1. **Scholarship Notification** - Green header (#4CAF50)
2. **Internship Notification** - Blue header (#2196F3)
3. **Deadline Reminder** - Orange header (#ff9800)
4. **Application Status** - Dynamic color (green/red/blue)
5. **Admin Message** - Purple header (#9C27B0)
6. **Broadcast** - Green header (#4CAF50)

---

## Integration Points

### 1. Scholarship Creation
When admin creates a scholarship:
```javascript
// In scholarshipController.js
const { notifyScholarship } = require('../controllers/emailController');

// After scholarship is created
await notifyScholarship(req.body.scholarshipId);
```

### 2. Internship Creation
When admin creates an internship:
```javascript
// In internshipController.js
const { notifyInternship } = require('../controllers/emailController');

// After internship is created
await notifyInternship(req.body.internshipId);
```

### 3. Application Status Update
When admin updates application status:
```javascript
// In applicationController.js
const { sendApplicationStatusEmail } = require('../services/emailService');

const user = await User.findById(application.userId);
await sendApplicationStatusEmail(user, application, newStatus);
```

### 4. Admin Sends Message
When admin sends message to student:
```javascript
// In messageController.js
const { sendAdminMessageEmail } = require('../services/emailService');

await sendAdminMessageEmail(student, admin, application, messageText);
```

---

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT token
2. **Role-Based Access**: Admin endpoints protected with `authorizeRoles('admin')`
3. **Email Validation**: Email format validation before sending
4. **Rate Limiting**: Can be added to prevent abuse
5. **Error Logging**: All failed emails logged with error details
6. **User Authorization**: Students can only access their own notifications

---

## Monitoring and Logging

### Email Logs
- All emails logged to EmailLog collection
- Track sent/failed status
- Store error messages for debugging
- Query by user or email address

### Notifications
- In-app notifications created for all emails
- Track emailSent status
- Mark as read when viewed
- Sort by creation date

### Console Logging
- Server logs all email operations
- Deadline reminder job logs
- Error tracking in console

---

## Testing

### Test Email Service
```bash
node -e "
const { sendEmail } = require('./services/emailService');
sendEmail('test@example.com', 'Test Subject', '<h1>Test</h1>');
"
```

### Test Deadline Reminder
```bash
node jobs/deadlineReminder.js
```

### Test API Endpoints
```bash
# Get notifications
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/api/notifications

# Get email history
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/api/notifications/email-history
```

---

## Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check SMTP credentials in .env
   - Verify firewall allows port 587
   - Check email provider settings
   - Review EmailLog for errors

2. **Authentication errors**:
   - For Gmail, use App Password (not regular password)
   - Ensure 2FA is enabled
   - Check SMTP_EMAIL and SMTP_PASSWORD

3. **Cron job not running**:
   - Check server logs for initialization
   - Verify node-cron is installed
   - Check MongoDB connection

4. **Duplicate reminders**:
   - Notification query checks for existing reminders
   - Clear old notifications if needed

---

## Performance Considerations

1. **Batch Processing**: Broadcast emails sent sequentially to avoid overwhelming SMTP server
2. **Database Indexing**: Proper indexes on userId, email, and timestamps
3. **Duplicate Prevention**: Checks prevent sending duplicate reminders
4. **Error Handling**: Failed emails don't stop the entire process
5. **Logging Limits**: Email history limited to 50 most recent entries

---

## Future Enhancements

1. **Email Templates**: Move HTML templates to separate files
2. **Queue System**: Implement job queue for bulk emails
3. **Retry Logic**: Retry failed emails with exponential backoff
4. **Email Preferences**: Allow users to opt-out of specific email types
5. **Analytics**: Track email open rates and click rates
6. **Attachments**: Support for email attachments
7. **Multi-language**: Support for multiple languages
8. **SMS Integration**: Add SMS notifications via Twilio

---

## Dependencies

```json
{
  "nodemailer": "^6.9.0",
  "node-cron": "^3.0.0"
}
```

---

## Complete Email Workflow

### 1. Admin Creates Scholarship
```
Admin creates scholarship
    ↓
Scholarship saved to database
    ↓
System triggers notifyScholarship()
    ↓
For each student:
    - sendScholarshipNotification() called
    - Email sent via Nodemailer
    - Email logged to EmailLog
    - Notification created in database
    ↓
Student receives email + in-app notification
```

### 2. Daily Deadline Check
```
Server starts
    ↓
initDeadlineReminderJob() called
    ↓
Initial deadline check runs
    ↓
Cron job scheduled (daily at 8:00 AM)
    ↓
Every day at 8:00 AM:
    - Check scholarships/internships ending in 7, 3, 1 days
    - For each opportunity:
        - Get all students
        - Check if reminder already sent
        - Send reminder if not sent
        - Log email and create notification
```

### 3. Application Status Update
```
Admin updates application status
    ↓
System triggers sendApplicationStatusEmail()
    ↓
Email sent to student with status details
    ↓
Email logged to EmailLog
    ↓
Notification created in database
    ↓
Student receives email + in-app notification
```

---

## API Documentation Summary

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| /api/notifications | GET | Student | Get all notifications |
| /api/notifications/email-history | GET | Student | Get email history |
| /api/notifications/:id/read | PATCH | Student | Mark notification as read |
| /api/admin/email/broadcast | POST | Admin | Send broadcast email |
| /api/admin/notifications/send | POST | Admin | Send manual notification |
| /api/admin/notifications/scholarship | POST | Admin | Notify all students about scholarship |
| /api/admin/notifications/internship | POST | Admin | Notify all students about internship |

---

## Maintenance

### Regular Tasks
1. Monitor EmailLog for failed emails
2. Clean up old notifications (optional)
3. Review email templates for updates
4. Check SMTP quota and limits
5. Monitor cron job execution logs

### Database Cleanup (Optional)
```javascript
// Delete notifications older than 90 days
Notification.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});

// Delete email logs older than 90 days
EmailLog.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});