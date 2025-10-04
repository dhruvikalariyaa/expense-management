const express = require('express');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users in company
router.get('/', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;
    
    const users = await User.find({ 
      company: companyId,
      isActive: true 
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
    const { name, email, password, role, managerId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;

    const user = new User({
      name,
      email,
      password,
      role,
      company: companyId,
      manager: managerId || null
    });

    await user.save();
    
    const userResponse = await User.findById(user._id).populate('manager', 'name email').select('-password');
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, role, managerId } = req.body;
    
    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;
    
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, company: companyId },
      { name, email, role, manager: managerId || null },
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
    }).select('name email role');

    res.json(managers);
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
