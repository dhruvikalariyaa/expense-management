const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const { auth } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Get countries and currencies
router.get('/countries', async (req, res) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    const countries = response.data.map(country => ({
      name: country.name.common,
      currency: Object.keys(country.currencies)[0] || 'USD'
    }));
    res.json(countries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch countries' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, country } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if this is the first user in the system
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    if (isFirstUser) {
      // First user becomes admin and creates company
      const countriesResponse = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
      const countryData = countriesResponse.data.find(c => c.name.common === country);
      const baseCurrency = countryData ? Object.keys(countryData.currencies)[0] : 'USD';

      // Create a temporary company ID for the admin user
      const tempCompanyId = new mongoose.Types.ObjectId();
      
      // Create admin user with temporary company ID
      const user = new User({
        name,
        email,
        password,
        role: 'admin',
        company: tempCompanyId
      });
      await user.save();

      // Create company with admin reference
      const company = new Company({
        _id: tempCompanyId,
        name: `${name}'s Company`,
        baseCurrency,
        country,
        admin: user._id
      });
      await company.save();

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Admin user registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: company
        }
      });
    } else {
      // Subsequent users need to be invited by admin
      return res.status(400).json({ 
        message: 'New user registration is disabled. Please contact your admin to get an account.' 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('company');
    if (!user || !user.isActive) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('company manager');
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      manager: user.manager
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
