const cron = require('node-cron');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const { sendDeadlineReminder } = require('../services/emailService');

dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Deadline Reminder Job: MongoDB Connected');
  } catch (error) {
    console.error('Deadline Reminder Job: MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Check and send deadline reminders
const checkDeadlines = async () => {
  try {
    console.log('\n=== Checking Deadlines ===');
    const today = new Date();

    // Check deadlines for 7, 3, and 1 days before
    const reminderDays = [7, 3, 1];

    for (const days of reminderDays) {
      const deadlineDate = new Date();
      deadlineDate.setDate(today.getDate() + days);

      console.log(`\nChecking deadlines for ${days} days from now (${deadlineDate.toDateString()})`);

      // Check scholarships
      const scholarships = await Scholarship.find({
        deadline: {
          $gte: new Date(deadlineDate.setHours(0, 0, 0, 0)),
          $lt: new Date(deadlineDate.setHours(23, 59, 59, 999)),
        },
        isActive: true,
      });

      console.log(`Found ${scholarships.length} scholarships ending in ${days} days`);

      for (const scholarship of scholarships) {
        await sendRemindersForOpportunity(scholarship, 'scholarship', days);
      }

      // Check internships
      const internships = await Internship.find({
        deadline: {
          $gte: new Date(deadlineDate.setHours(0, 0, 0, 0)),
          $lt: new Date(deadlineDate.setHours(23, 59, 59, 999)),
        },
      });

      console.log(`Found ${internships.length} internships ending in ${days} days`);

      for (const internship of internships) {
        await sendRemindersForOpportunity(internship, 'internship', days);
      }
    }

    console.log('=== Deadline Check Complete ===\n');
  } catch (error) {
    console.error('Error checking deadlines:', error);
  }
};

// Send reminders for a specific opportunity
const sendRemindersForOpportunity = async (opportunity, type, daysRemaining) => {
  try {
    // Get all students
    const students = await User.find({ role: 'student' });

    let successCount = 0;
    let failCount = 0;

    for (const student of students) {
      // Check if reminder already sent for this opportunity and days combination
      const existingNotification = await Notification.findOne({
        userId: student._id,
        relatedId: opportunity._id,
        relatedModel: type === 'scholarship' ? 'Scholarship' : 'Internship',
        type: 'deadline',
        message: { $regex: `${daysRemaining} days remaining` },
      });

      // Only send if not already sent
      if (!existingNotification) {
        const result = await sendDeadlineReminder(student, opportunity, type, daysRemaining);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }
    }

    if (successCount > 0 || failCount > 0) {
      console.log(
        `Deadline reminders for ${opportunity.title}: ${successCount} sent, ${failCount} failed`
      );
    }
  } catch (error) {
    console.error(`Error sending reminders for ${opportunity.title}:`, error);
  }
};

// Initialize the job
const initDeadlineReminderJob = async () => {
  await connectDB();

  // Run immediately on startup
  console.log('Running initial deadline check...');
  await checkDeadlines();

  // Schedule to run daily at 8:00 AM
  cron.schedule('0 8 * * *', () => {
    console.log('Running scheduled deadline check...');
    checkDeadlines();
  });

  console.log('Deadline reminder job scheduled to run daily at 8:00 AM');
};

// Export for use in server.js
module.exports = { initDeadlineReminderJob, checkDeadlines };

// If running directly (for testing)
if (require.main === module) {
  initDeadlineReminderJob().then(() => {
    console.log('Deadline reminder job initialized successfully');
  });
}