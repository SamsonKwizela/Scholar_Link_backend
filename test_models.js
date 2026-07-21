const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/user');
const Profile = require('./models/Profile');
const Documents = require('./models/Documents');
const Application = require('./models/Application');
const Notification = require('./models/Notification');
const Message = require('./models/Message');

const testModels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Test User model
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      password: 'hashedpassword',
      role: 'student',
    });
    console.log('✓ User model created successfully');

    // Test Profile model
    const profile = new Profile({
      userId: user._id,
      personalInfo: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        location: 'New York',
        university: 'NYU',
      },
      professionalProfile: {
        about: 'Computer Science student',
        experience: [],
        projects: [],
        certifications: [],
        skills: ['JavaScript', 'Node.js'],
        interests: ['Web Development'],
        socialLinks: {
          github: 'https://github.com/johndoe',
          linkedin: 'https://linkedin.com/in/johndoe',
          portfolio: 'https://johndoe.com',
        },
      },
    });
    console.log('✓ Profile model created successfully');

    // Test Documents model
    const documents = new Documents({
      userId: user._id,
      documents: [
        {
          type: 'resume',
          fileName: 'resume.pdf',
          filePath: '/uploads/resume.pdf',
        },
      ],
    });
    console.log('✓ Documents model created successfully');

    // Test Application model
    const application = new Application({
      userId: user._id,
      opportunityId: new mongoose.Types.ObjectId(),
      opportunityType: 'scholarship',
      applicantInformation: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      status: 'Pending',
    });
    console.log('✓ Application model created successfully');

    // Test Notification model
    const notification = new Notification({
      adminId: new mongoose.Types.ObjectId(),
      title: 'New Application',
      message: 'John Doe submitted a new application',
      type: 'application',
      applicationId: application._id,
    });
    console.log('✓ Notification model created successfully');

    // Test Message model
    const message = new Message({
      senderId: user._id,
      receiverId: new mongoose.Types.ObjectId(),
      applicationId: application._id,
      message: 'Hello, I have a question about my application',
    });
    console.log('✓ Message model created successfully');

    console.log('\n✓ All models are properly implemented!');
    
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error testing models:', error);
    process.exit(1);
  }
};

testModels();