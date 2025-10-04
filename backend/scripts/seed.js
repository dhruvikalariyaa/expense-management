const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Company = require('../models/Company');
const ApprovalRule = require('../models/ApprovalRule');
require('dotenv').config({ path: '../env.backend' });

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-management');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await ApprovalRule.deleteMany({});
    console.log('Cleared existing data');

    // Create a temporary company ID for the admin user
    const tempCompanyId = new mongoose.Types.ObjectId();
    
    // Create admin user with temporary company ID
    const admin = new User({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
      company: tempCompanyId
    });
    await admin.save();
    console.log('Created admin user');

    // Create demo company with admin reference
    const company = new Company({
      _id: tempCompanyId,
      name: 'Demo Company Ltd',
      baseCurrency: 'USD',
      country: 'United States',
      admin: admin._id
    });
    await company.save();
    console.log('Created demo company');

    // Create manager user
    const manager = new User({
      name: 'Sarah Manager',
      email: 'sarah@demo.com',
      password: 'manager123',
      role: 'manager',
      company: company._id,
      manager: admin._id
    });
    await manager.save();
    console.log('Created manager user');

    // Create employee users
    const employee1 = new User({
      name: 'John Employee',
      email: 'john@demo.com',
      password: 'employee123',
      role: 'employee',
      company: company._id,
      manager: manager._id
    });
    await employee1.save();

    const employee2 = new User({
      name: 'Jane Employee',
      email: 'jane@demo.com',
      password: 'employee123',
      role: 'employee',
      company: company._id,
      manager: manager._id
    });
    await employee2.save();
    console.log('Created employee users');

    // Create approval rule
    // Create multiple approval rules to demonstrate different types
    const approvalRules = [
      {
        name: 'Sequential Approval Rule',
        description: 'Manager must approve first, then Admin (Sequential)',
        isManagerApprover: true,
        approvers: [manager._id, admin._id],
        isSequential: true,
        minimumApprovalPercentage: 100,
        specificApprovers: []
      },
      {
        name: 'Percentage Rule',
        description: '60% of approvers must approve (Parallel)',
        isManagerApprover: true,
        approvers: [manager._id, admin._id],
        isSequential: false,
        minimumApprovalPercentage: 60,
        specificApprovers: []
      },
      {
        name: 'Hybrid Rule',
        description: '60% OR Admin can auto-approve',
        isManagerApprover: true,
        approvers: [manager._id, admin._id],
        isSequential: false,
        minimumApprovalPercentage: 60,
        specificApprovers: [admin._id]
      },
      {
        name: 'Admin Override Rule',
        description: 'Admin can auto-approve any expense',
        isManagerApprover: false,
        approvers: [admin._id],
        isSequential: false,
        minimumApprovalPercentage: 100,
        specificApprovers: [admin._id]
      }
    ];

    for (const ruleData of approvalRules) {
      const approvalRule = new ApprovalRule({
        company: company._id,
        ...ruleData
      });
      await approvalRule.save();
      console.log(`Created approval rule: ${ruleData.name}`);
    }

    console.log('\n=== Demo Data Created Successfully ===');
    console.log('Admin: admin@demo.com / admin123');
    console.log('Manager: sarah@demo.com / manager123');
    console.log('Employee: john@demo.com / employee123');
    console.log('Employee: jane@demo.com / employee123');
    console.log('=====================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
