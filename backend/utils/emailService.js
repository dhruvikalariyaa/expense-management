const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate random password
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send password email
const sendPasswordEmail = async (userEmail, userName, password) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Your Account Password - Expense Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Expense Management System</h2>
          <p>Hello ${userName},</p>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
          </div>
          <p><strong>Important:</strong> Please change your password after your first login for security reasons.</p>
          <p>You can log in using the "Forgot Password" feature to reset your password anytime.</p>
          <p>Best regards,<br>Expense Management Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send forgot password email with reset link
const sendForgotPasswordEmail = async (userEmail, userName, resetToken) => {
  try {
    const transporter = createTransporter();
    
    // Create reset link - you'll need to update this with your frontend URL
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Password Reset - Expense Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>You have requested a password reset. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
          </p>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
          </div>
          <p>If you did not request this password reset, please contact your administrator immediately.</p>
          <p>Best regards,<br>Expense Management Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateRandomPassword,
  generateResetToken,
  sendPasswordEmail,
  sendForgotPasswordEmail
};
