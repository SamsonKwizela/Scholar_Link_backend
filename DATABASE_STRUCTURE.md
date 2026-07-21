# ScholarLink Database Structure

## Overview
This document describes the MongoDB database structure for the ScholarLink scholarship and internship application platform.

## Technology Stack
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT

---

## Collections (Models)

### 1. User Collection
**File**: `models/user.js`

**Purpose**: Store user authentication and basic profile information.

**Schema**:
```javascript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: String (required),
  password: String (required),
  role: String (enum: ["student", "admin"], default: "student"),
  profilePicture: String (default: null),
  location: String (default: null),
  university: String (default: null),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email` (ascending)
- `role` (ascending)

**Relationships**:
- One-to-One with Profile
- One-to-Many with Documents
- One-to-Many with Applications
- One-to-Many with Notifications (as adminId)
- One-to-Many with Messages (as senderId/receiverId)

---

### 2. Profile Collection
**File**: `models/Profile.js`

**Purpose**: Store detailed professional information for application generation and PDF creation.

**Schema**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required, unique),
  personalInfo: {
    fullName: String (required),
    email: String (required),
    phone: String (required),
    location: String (required),
    university: String (required)
  },
  professionalProfile: {
    about: String (default: ''),
    experience: [{
      title: String (required),
      company: String (required),
      duration: String (required),
      description: String (required)
    }],
    projects: [{
      name: String (required),
      description: String (required),
      technologies: String (required)
    }],
    certifications: [{
      name: String (required),
      provider: String (required),
      year: Number (required)
    }],
    skills: [String],
    interests: [String],
    socialLinks: {
      github: String (default: ''),
      linkedin: String (default: ''),
      portfolio: String (default: '')
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `userId` (ascending)

**Relationships**:
- Belongs to User (one-to-one)

---

### 3. Documents Collection
**File**: `models/Documents.js`

**Purpose**: Store uploaded student documents (resume, cover letter, certificates, etc.).

**Schema**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  documents: [{
    type: String (enum: ["resume", "coverLetter", "certificate", "other"], required),
    fileName: String (required),
    filePath: String (required),
    uploadedAt: Date (default: Date.now)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `userId` (ascending)

**Relationships**:
- Belongs to User (one-to-many)

---

### 4. Application Collection
**File**: `models/Application.js`

**Purpose**: Track all scholarship and internship applications submitted by students.

**Schema**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  opportunityId: ObjectId (required),
  opportunityType: String (enum: ["scholarship", "internship"], required),
  applicantInformation: {
    name: String (required),
    email: String (required)
  },
  generatedFiles: {
    profilePDF: String (default: null),
    applicationFolder: String (default: null)
  },
  attachedDocuments: [{
    name: String (required),
    path: String (required),
    type: String (required)
  }],
  status: String (enum: ["Pending", "Reviewing", "Accepted", "Rejected"], default: "Pending"),
  adminFeedback: String (default: ''),
  submittedAt: Date (default: Date.now),
  reviewedAt: Date (default: null),
  reviewedBy: ObjectId (ref: User, default: null),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ userId: 1, opportunityId: 1, opportunityType: 1 }` (unique)
- `{ status: 1, submittedAt: -1 }`
- `{ userId: 1, submittedAt: -1 }`

**Relationships**:
- Belongs to User
- Has many Notifications
- Has many Messages

---

### 5. Notification Collection
**File**: `models/Notification.js`

**Purpose**: Notify administrators when new applications are submitted.

**Schema**:
```javascript
{
  _id: ObjectId,
  adminId: ObjectId (ref: User, required),
  title: String (required),
  message: String (required),
  type: String (enum: ["application", "system"], default: "application"),
  applicationId: ObjectId (ref: Application, required),
  read: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ adminId: 1, createdAt: -1 }`
- `{ applicationId: 1 }`

**Relationships**:
- Belongs to User (admin)
- Belongs to Application

---

### 6. Message Collection
**File**: `models/Message.js`

**Purpose**: Store communication between administrators and students regarding applications.

**Schema**:
```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: User, required),
  receiverId: ObjectId (ref: User, required),
  applicationId: ObjectId (ref: Application, required),
  message: String (required),
  read: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ applicationId: 1, createdAt: -1 }`
- `{ senderId: 1, receiverId: 1 }`

**Relationships**:
- Belongs to User (sender)
- Belongs to User (receiver)
- Belongs to Application

---

## Entity Relationship Diagram

```
User (1) ──────┬────── (1) Profile
               │
               ├────── (1) Documents
               │
               ├────── (N) Applications
               │              │
               │              ├────── (N) Notifications
               │              │
               │              └────── (N) Messages
               │
               ├────── (N) Notifications (as admin)
               │
               └────── (N) Messages (as sender/receiver)
```

---

## Data Flow

### 1. User Registration & Profile Creation
1. User registers → User document created
2. User creates profile → Profile document created (linked to User)
3. User uploads documents → Documents document created/updated (linked to User)

### 2. Application Submission
1. User submits application → Application document created (linked to User)
2. System generates PDF/folder → Application document updated with file paths
3. System creates notification → Notification document created for all admins (linked to Application)

### 3. Application Review
1. Admin reviews application → Application status updated
2. Admin adds feedback → Application document updated with feedback
3. Admin sends message → Message document created (linked to Application)
4. Student reads message → Message document updated (read: true)

---

## Key Features

### Data Validation
- All required fields are validated
- Enum values ensure data consistency
- Unique constraints prevent duplicate applications
- ObjectId references ensure data integrity

### Indexing Strategy
- User email indexed for fast authentication
- Role indexed for quick admin/student queries
- Application status and submission date indexed for filtering
- Notification and message timestamps indexed for chronological retrieval

### Timestamps
- All models include `createdAt` and `updatedAt` timestamps
- Automatic tracking of document creation and modifications

### Data Consistency
- Foreign key references maintain referential integrity
- Unique compound index on applications prevents duplicate submissions
- Cascade deletion can be implemented for related documents

---

## API Endpoints (Frontend Integration)

### User Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Documents Endpoints
- `POST /api/upload/documents` - Upload documents
- `GET /api/upload/documents` - Get user documents
- `DELETE /api/upload/documents/:id` - Delete document

### Application Endpoints
- `POST /api/applications` - Submit application
- `GET /api/applications` - Get user applications
- `GET /api/applications/:id` - Get specific application
- `PUT /api/applications/:id` - Update application (admin)
- `GET /api/applications/admin/all` - Get all applications (admin)

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

### Message Endpoints
- `POST /api/messages` - Send message
- `GET /api/messages/application/:applicationId` - Get messages for application
- `PUT /api/messages/:id/read` - Mark message as read

---

## Implementation Notes

1. **Password Security**: User passwords should be hashed using bcrypt before storage
2. **JWT Authentication**: Use JWT tokens for secure API access
3. **File Uploads**: Store uploaded files in the `/uploads` directory with proper validation
4. **PDF Generation**: Use libraries like pdfkit or puppeteer for profile PDF generation
5. **Email Notifications**: Integrate email service for application confirmations
6. **Data Cleanup**: Implement cleanup jobs for old notifications and messages

---

## Testing

All models have been tested and verified to work correctly with MongoDB. Run `node test_models.js` to verify model implementations.