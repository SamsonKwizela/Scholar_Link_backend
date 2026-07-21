const { protect, authorizeRoles } = require('../middleware/auth');
const AppError = require('../utils/appError');
const { createSuccessResponse, createErrorResponse } = require('../utils/response');
const User = require('../models/User');
const EmailLog = require('../models/EmailLog');
const Notification = require('../models/Notification');
const {
  sendScholarshipNotification,
  sendInternshipNotification,
  sendApplicationStatusEmail,
  sendAdminMessageEmail,
  broadcastEmail,
} = require('../services/emailService');

// @desc    Send broadcast email to all students
// @route   POST /api/admin/email/broadcast
// @access  Admin only
const sendBroadcastEmail = async (req, res, next) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return next(new AppError('Please provide subject and message', 400));
    }

    // Get all students
    const students = await User.find({ role: 'student' });

    if (students.length === 0) {
      return next(new AppError('No students found', 404));
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Announcement from ScholarLink</h1>
          </div>
          <div class="content">
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <div class="footer">
            <p>© 2025 ScholarLink. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const results = await broadcastEmail(students, subject, htmlContent);

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    res.status(200).json(
      createSuccessResponse({
        message: `Broadcast completed. ${successCount} emails sent, ${failedCount} failed.`,
        results,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Send notification manually
// @route   POST /api/admin/notifications/send
// @access  Admin only
const sendNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type = 'system', sendEmail = true } = req.body;

    if (!userId || !title || !message) {
      return next(new AppError('Please provide userId, title, and message', 400));
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Create notification
    const notification = await Notification.create({
      userId: userId,
      title: title,
      message: message,
      type: type,
      emailSent: false,
    });

    // Send email if requested
    if (sendEmail) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="content">
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            <div class="footer">
              <p>© 2025 ScholarLink. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResult = await require('../services/emailService').sendEmail(
        user.email,
        title,
        htmlContent,
        user._id
      );

      // Update notification with email status
      notification.emailSent = emailResult.success;
      await notification.save();
    }

    res.status(201).json(
      createSuccessResponse({
        notification,
        emailSent: sendEmail,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get email history
// @route   GET /api/notifications/email-history
// @access  Private
const getEmailHistory = async (req, res, next) => {
  try {
    const emailLogs = await EmailLog.find({ userId: req.user._id })
      .sort({ sentAt: -1 })
      .limit(50);

    res.status(200).json(createSuccessResponse({ emailLogs }));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(createSuccessResponse({ notifications }));
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    notification.read = true;
    await notification.save();

    res.status(200).json(createSuccessResponse({ notification }));
  } catch (error) {
    next(error);
  }
};

// @desc    Send scholarship notification to all students
// @route   POST /api/admin/notifications/scholarship
// @access  Admin only
const notifyScholarship = async (req, res, next) => {
  try {
    const { scholarshipId } = req.body;

    if (!scholarshipId) {
      return next(new AppError('Please provide scholarshipId', 400));
    }

    const Scholarship = require('../models/Scholarship');
    const scholarship = await Scholarship.findById(scholarshipId);

    if (!scholarship) {
      return next(new AppError('Scholarship not found', 404));
    }

    // Get all students
    const students = await User.find({ role: 'student' });

    let successCount = 0;
    let failCount = 0;

    for (const student of students) {
      const result = await sendScholarshipNotification(student, scholarship);
      if (result.success) successCount++;
      else failCount++;
    }

    res.status(200).json(
      createSuccessResponse({
        message: `Scholarship notification sent. ${successCount} emails sent, ${failCount} failed.`,
        successCount,
        failCount,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Send internship notification to all students
// @route   POST /api/admin/notifications/internship
// @access  Admin only
const notifyInternship = async (req, res, next) => {
  try {
    const { internshipId } = req.body;

    if (!internshipId) {
      return next(new AppError('Please provide internshipId', 400));
    }

    const Internship = require('../models/Internship');
    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return next(new AppError('Internship not found', 404));
    }

    // Get all students
    const students = await User.find({ role: 'student' });

    let successCount = 0;
    let failCount = 0;

    for (const student of students) {
      const result = await sendInternshipNotification(student, internship);
      if (result.success) successCount++;
      else failCount++;
    }

    res.status(200).json(
      createSuccessResponse({
        message: `Internship notification sent. ${successCount} emails sent, ${failCount} failed.`,
        successCount,
        failCount,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendBroadcastEmail,
  sendNotification,
  getEmailHistory,
  getAllNotifications,
  markNotificationAsRead,
  notifyScholarship,
  notifyInternship,
};