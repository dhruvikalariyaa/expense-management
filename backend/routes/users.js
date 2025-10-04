const express = require('express');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { generateRandomPassword, sendPasswordEmail } = require('../utils/emailService');

const router = express.Router();

// Get all users in company
router.get('/', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;
    
    const users = await User.find({ 
      company: companyId, 
    }).populate('manager', 'name email').select('-password');
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, role, managerId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate random password
    const generatedPassword = generateRandomPassword();

    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;

    const user = new User({
      name,
      email,
      password: generatedPassword,
      role,
      company: companyId,
      manager: managerId || null
    });

    await user.save();
    
    // Send password email
    const emailResult = await sendPasswordEmail(email, name, generatedPassword);
    if (!emailResult.success) {
      console.error('Failed to send password email:', emailResult.error);
      // Don't fail the user creation, just log the error
    }
    
    const userResponse = await User.findById(user._id).populate('manager', 'name email').select('-password');
    res.status(201).json({
      ...userResponse.toObject(),
      passwordSent: emailResult.success
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, role, managerId ,isActive} = req.body;
    
    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;
    
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, company: companyId },
      { name, email, role, manager: managerId || null ,isActive:isActive !== false},
      { new: true }
    ).populate('manager', 'name email').select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (soft delete)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;
    
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, company: companyId },
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send password to user
router.post('/:id/send-password', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;
    
    const user = await User.findOne({
      _id: req.params.id,
      company: companyId,
      isActive: true
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new random password
    const newPassword = generateRandomPassword();
    
    // Update user password
    user.password = newPassword;
    await user.save();

    // Send password email
    const emailResult = await sendPasswordEmail(user.email, user.name, newPassword);
    
    if (emailResult.success) {
      res.json({ message: 'Password sent successfully', passwordSent: true });
    } else {
      res.status(500).json({ 
        message: 'Password updated but failed to send email', 
        passwordSent: false,
        error: emailResult.error 
      });
    }
  } catch (error) {
    console.error('Send password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get managers for dropdown
router.get('/managers', auth, async (req, res) => {
  try {
    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;
    
    const managers = await User.find({
      company: companyId,
      role: { $in: ['admin', 'manager'] },
      isActive: true
    }).select('name email role isActive');

    res.json(managers);
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
