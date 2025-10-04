const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { generateResetToken, sendForgotPasswordEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email' 
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();

    // Save reset token to database
    const resetTokenDoc = new PasswordResetToken({
      userId: user._id,
      token: resetToken
    });

    await resetTokenDoc.save();

    // Send reset email
    const emailResult = await sendForgotPasswordEmail(user.email, user.name, resetToken);
    
    if (emailResult.success) {
      res.json({ 
        success: true, 
        message: 'Password reset link sent to your email' 
      });
    } else {
      // Clean up the token if email failed
      await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id });
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send email. Please try again.' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Find valid reset token
    const resetTokenDoc = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!resetTokenDoc) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await User.findByIdAndUpdate(resetTokenDoc.userId._id, {
      password: hashedPassword
    });

    // Mark token as used
    resetTokenDoc.used = true;
    await resetTokenDoc.save();

    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Verify reset token (for frontend to check if token is valid)
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const resetTokenDoc = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId', 'name email');

    if (!resetTokenDoc) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Token is valid',
      user: {
        name: resetTokenDoc.userId.name,
        email: resetTokenDoc.userId.email
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;
