const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const EmailLog = require('../models/EmailLog');
const Notification = require('../models/Notification');
const User = require('../models/User');

dotenv.config();

// Create nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Generic send email function
const sendEmail = async (to, subject, htmlContent, userId = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log successful email
    if (userId) {
      await EmailLog.create({
        userId: userId,
        email: to,
        subject: subject,
        message: htmlContent,
        status: 'sent',
        sentAt: new Date(),
      });
    }

    console.log(`Email sent successfully to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);

    // Log failed email
    if (userId) {
      await EmailLog.create({
        userId: userId,
        email: to,
        subject: subject,
        message: htmlContent,
        status: 'failed',
        error: error.message,
        sentAt: new Date(),
      });
    }

    return { success: false, error: error.message };
  }
};

// Send scholarship notification
const sendScholarshipNotification = async (user, scholarship) => {
  const subject = 'New Scholarship Opportunity Available';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Scholarship Opportunity</h1>
        </div>
        <div class="content">
          <h2>${scholarship.title}</h2>
          <p><strong>Provider:</strong> ${scholarship.provider}</p>
          <p><strong>Description:</strong> ${scholarship.description}</p>
          <p><strong>Requirements:</strong> ${scholarship.requirements}</p>
          <p><strong>Deadline:</strong> ${new Date(scholarship.deadline).toLocaleDateString()}</p>
          <p><strong>Amount:</strong> $${scholarship.amount}</p>
          
          <a href="${process.env.FRONTEND_URL}/scholarships/${scholarship._id}" class="button">Apply Now</a>
        </div>
        <div class="footer">
          <p>© 2025 ScholarLink. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail(user.email, subject, htmlContent, user._id);

  // Create notification
  if (result.success) {
    await Notification.create({
      userId: user._id,
      title: subject,
      message: `New scholarship opportunity: ${scholarship.title}`,
      type: 'scholarship',
      emailSent: true,
      relatedId: scholarship._id,
      relatedModel: 'Scholarship',
    });
  }

  return result;
};

// Send internship notification
const sendInternshipNotification = async (user, internship) => {
  const subject = 'New Internship Opportunity Available';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Internship Opportunity</h1>
        </div>
        <div class="content">
          <h2>${internship.title}</h2>
          <p><strong>Company:</strong> ${internship.company}</p>
          <p><strong>Location:</strong> ${internship.location}</p>
          <p><strong>Description:</strong> ${internship.description}</p>
          <p><strong>Requirements:</strong> ${internship.requirements}</p>
          <p><strong>Duration:</strong> ${internship.duration}</p>
          <p><strong>Deadline:</strong> ${new Date(internship.deadline).toLocaleDateString()}</p>
          <p><strong>Salary:</strong> $${internship.salary}/month</p>
          
          <a href="${process.env.FRONTEND_URL}/internships/${internship._id}" class="button">Apply Now</a>
        </div>
        <div class="footer">
          <p>© 2025 ScholarLink. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail(user.email, subject, htmlContent, user._id);

  // Create notification
  if (result.success) {
    await Notification.create({
      userId: user._id,
      title: subject,
      message: `New internship opportunity: ${internship.title} at ${internship.company}`,
      type: 'internship',
      emailSent: true,
      relatedId: internship._id,
      relatedModel: 'Internship',
    });
  }

  return result;
};

// Send deadline reminder
const sendDeadlineReminder = async (user, opportunity, type, daysRemaining) => {
  const subject = `Reminder: ${daysRemaining} days left to apply for ${opportunity.title}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .urgent { color: #f44336; font-weight: bold; }
        .button { display: inline-block; padding: 12px 24px; background-color: #ff9800; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Deadline Reminder</h1>
        </div>
        <div class="content">
          <h2>${opportunity.title}</h2>
          <p class="urgent">Only ${daysRemaining} days remaining to apply!</p>
          <p><strong>Deadline:</strong> ${new Date(opportunity.deadline).toLocaleDateString()}</p>
          
          ${type === 'scholarship' ? `
            <p><strong>Provider:</strong> ${opportunity.provider}</p>
            <p><strong>Amount:</strong> $${opportunity.amount}</p>
          ` : `
            <p><strong>Company:</strong> ${opportunity.company}</p>
            <p><strong>Location:</strong> ${opportunity.location}</p>
          `}
          
          <a href="${process.env.FRONTEND_URL}/${type}s/${opportunity._id}" class="button">Apply Now</a>
        </div>
        <div class="footer">
          <p>© 2025 ScholarLink. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail(user.email, subject, htmlContent, user._id);

  // Create notification
  if (result.success) {
    await Notification.create({
      userId: user._id,
      title: subject,
      message: `${daysRemaining} days remaining to apply for ${opportunity.title}`,
      type: 'deadline',
      emailSent: true,
      relatedId: opportunity._id,
      relatedModel: type === 'scholarship' ? 'Scholarship' : 'Internship',
    });
  }

  return result;
};

// Send application status email
const sendApplicationStatusEmail = async (user, application, status) => {
  let subject, message, htmlContent;

  switch (status) {
    case 'Accepted':
      subject = 'Congratulations! Your Application Has Been Accepted';
      message = 'Congratulations, your application has been accepted.';
      break;
    case 'Rejected':
      subject = 'Application Status Update';
      message = 'Your application was not successful.';
      break;
    case 'Reviewing':
      subject = 'Application Under Review';
      message = 'Your application is currently under review.';
      break;
    default:
      subject = 'Application Status Update';
      message = 'Your application status has been updated.';
  }

  htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${status === 'Accepted' ? '#4CAF50' : status === 'Rejected' ? '#f44336' : '#2196F3'}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${subject}</h1>
        </div>
        <div class="content">
          <p>Dear ${user.firstName} ${user.lastName},</p>
          <p>${message}</p>
          <p><strong>Application ID:</strong> ${application._id}</p>
          <p><strong>Status:</strong> ${status}</p>
          ${application.adminFeedback ? `<p><strong>Admin Feedback:</strong> ${application.adminFeedback}</p>` : ''}
          <p>Please log in to your dashboard for more details.</p>
        </div>
        <div class="footer">
          <p>© 2025 ScholarLink. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail(user.email, subject, htmlContent, user._id);

  // Create notification
  if (result.success) {
    await Notification.create({
      userId: user._id,
      title: subject,
      message: message,
      type: 'application',
      emailSent: true,
      relatedId: application._id,
      relatedModel: 'Application',
    });
  }

  return result;
};

// Send admin message email
const sendAdminMessageEmail = async (user, admin, application, messageText) => {
  const subject = 'New Message From ScholarLink Admin';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .message-box { background-color: white; padding: 15px; border-left: 4px solid #9C27B0; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #9C27B0; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Message From Admin</h1>
        </div>
        <div class="content">
          <p>Dear ${user.firstName} ${user.lastName},</p>
          <p>You have received a new message from ScholarLink admin regarding your application.</p>
          
          <div class="message-box">
            <p><strong>Message:</strong></p>
            <p>${messageText}</p>
          </div>
          
          <p><strong>Application Reference:</strong> ${application._id}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <a href="${process.env.FRONTEND_URL}/applications/${application._id}" class="button">View Application</a>
        </div>
        <div class="footer">
          <p>© 2025 ScholarLink. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail(user.email, subject, htmlContent, user._id);

  // Create notification
  if (result.success) {
    await Notification.create({
      userId: user._id,
      title: subject,
      message: `Admin message: ${messageText.substring(0, 100)}...`,
      type: 'system',
      emailSent: true,
      relatedId: application._id,
      relatedModel: 'Application',
    });
  }

  return result;
};

// Broadcast email to multiple users
const broadcastEmail = async (users, subject, htmlContent) => {
  const results = [];
  
  for (const user of users) {
    const result = await sendEmail(user.email, subject, htmlContent, user._id);
    results.push({ userId: user._id, email: user.email, success: result.success });
  }

  return results;
};

module.exports = {
  sendEmail,
  sendScholarshipNotification,
  sendInternshipNotification,
  sendDeadlineReminder,
  sendApplicationStatusEmail,
  sendAdminMessageEmail,
  broadcastEmail,
};