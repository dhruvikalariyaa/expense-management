const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Expense = require('../models/Expense');
const User = require('../models/User');
const ApprovalRule = require('../models/ApprovalRule');
const { auth, requireRole } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/receipts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

// Get currency conversion rate
const getConversionRate = async (fromCurrency, toCurrency) => {
  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    return response.data.rates[toCurrency] || 1;
  } catch (error) {
    console.error('Currency conversion error:', error);
    return 1; // Fallback to 1:1 ratio
  }
};

// Get all expenses for user
router.get('/', auth, async (req, res) => {
  try {
    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;
    
    let query = { company: companyId };
    
    // If user is employee, only show their expenses
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    }
    // If user is manager, show their team's expenses
    else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        $or: [
          { manager: req.user._id },
          { _id: req.user._id }
        ],
        company: companyId
      }).select('_id');
      
      query.employee = { $in: teamMembers.map(member => member._id) };
    }

    const expenses = await Expense.find(query)
      .populate('employee', 'name email')
      .populate('approvals.approver', 'name email')
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending approvals for manager/admin
router.get('/pending', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;
    
    let query = { 
      company: companyId,
      status: 'waiting_approval'
    };

    // If manager, show expenses where they are current approver or have pending approval
    if (req.user.role === 'manager') {
      query.$or = [
        { currentApprover: req.user._id },
        { 
          'approvals': {
            $elemMatch: {
              'approver': req.user._id,
              'status': 'pending'
            }
          }
        }
      ];
    }

    const expenses = await Expense.find(query)
      .populate('employee', 'name email manager')
      .populate('approvals.approver', 'name email')
      .sort({ createdAt: -1 });

    // Debug logging
    console.log('Manager ID:', req.user._id);
    console.log('Query:', JSON.stringify(query, null, 2));
    console.log('Found expenses:', expenses.length);
    
    // Log each expense's approval status for this manager
    expenses.forEach(expense => {
      const managerApproval = expense.approvals.find(
        approval => approval.approver.toString() === req.user._id.toString()
      );
      console.log(`Expense ${expense._id}: Manager approval status:`, managerApproval?.status);
      console.log(`Current approver:`, expense.currentApprover);
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new expense
router.post('/', auth, requireRole(['employee']), async (req, res) => {
  try {
    const { description, category, amount, currency, expenseDate, paidBy } = req.body;

    // Convert amount to number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Get the user's company ID and base currency
    const currentUser = await User.findById(req.user._id).populate('company');
    if (!currentUser || !currentUser.company) {
      return res.status(400).json({ message: 'User company not found' });
    }
    
    const companyId = currentUser.company._id;
    const baseCurrency = currentUser.company.baseCurrency;

    // Convert amount to company base currency
    const conversionRate = await getConversionRate(currency, baseCurrency);
    const convertedAmount = numericAmount * conversionRate;

    const expense = new Expense({
      employee: req.user._id,
      company: companyId,
      description,
      category,
      amount: numericAmount,
      currency,
      convertedAmount,
      expenseDate: new Date(expenseDate),
      paidBy: paidBy || 'Cash', // Default to 'Cash' if not provided
      status: 'draft'
    });

    await expense.save();
    
    const populatedExpense = await Expense.findById(expense._id)
      .populate('employee', 'name email');

    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Submit expense for approval
router.post('/:id/submit', auth, requireRole(['employee']), async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      employee: req.user._id,
      status: 'draft'
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Get approval rule for the company
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;
    
    const approvalRule = await ApprovalRule.findOne({
      company: companyId,
      isActive: true
    });

    if (!approvalRule) {
      return res.status(400).json({ message: 'No approval rule configured' });
    }

    // Set up approval workflow
    expense.status = 'waiting_approval';
    expense.approvalRule = approvalRule._id;
    
    // Initialize approvals array
    const approvers = [...approvalRule.approvers];
    
    // Get the employee's manager if manager approval is required
    if (approvalRule.isManagerApprover) {
      const employee = await User.findById(req.user._id);
      console.log('Employee:', employee.name, 'Manager:', employee.manager);
      if (employee.manager) {
        approvers.unshift(employee.manager);
        console.log('Added manager to approvers:', employee.manager);
      } else {
        console.log('No manager assigned to employee');
      }
    }
    
    console.log('Final approvers list:', approvers);

    expense.approvals = approvers.map(approverId => ({
      approver: approverId,
      status: 'pending'
    }));

    // Set current approver based on sequential or parallel
    if (approvalRule.isSequential) {
      expense.currentApprover = approvers[0];
    } else {
      expense.currentApprover = null; // All approvers can approve simultaneously
    }

    await expense.save();
    
    const populatedExpense = await Expense.findById(expense._id)
      .populate('employee', 'name email')
      .populate('approvals.approver', 'name email');

    res.json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload receipt
router.post('/:id/receipt', auth, requireRole(['employee']), upload.single('receipt'), async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      employee: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    expense.receipt = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype
    };

    await expense.save();
    res.json({ message: 'Receipt uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject expense
router.post('/:id/approve', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { action, comment } = req.body; // action: 'approve' or 'reject'
    
    // Get the user's company ID
    const currentUser = await User.findById(req.user._id);
    const companyId = currentUser.company;
    
    const expense = await Expense.findOne({
      _id: req.params.id,
      company: companyId,
      status: 'waiting_approval'
    }).populate('approvalRule');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user is authorized to approve
    const userApproval = expense.approvals.find(
      approval => approval.approver.toString() === req.user._id.toString()
    );

    if (!userApproval || userApproval.status !== 'pending') {
      return res.status(403).json({ message: 'Not authorized to approve this expense' });
    }

    // Update approval status
    userApproval.status = action === 'approve' ? 'approved' : 'rejected';
    userApproval.comment = comment;
    userApproval.approvedAt = new Date();

    // Check if approval process is complete
    const approvalRule = expense.approvalRule;
    const totalApprovers = expense.approvals.length;
    const approvedCount = expense.approvals.filter(a => a.status === 'approved').length;
    const rejectedCount = expense.approvals.filter(a => a.status === 'rejected').length;
    
    console.log('Approval process check:', {
      userId: req.user._id,
      userRole: req.user.role,
      action: action,
      totalApprovers: totalApprovers,
      approvedCount: approvedCount,
      rejectedCount: rejectedCount,
      specificApprovers: approvalRule.specificApprovers,
      isSequential: approvalRule.isSequential,
      minimumPercentage: approvalRule.minimumApprovalPercentage
    });

    let isComplete = false;
    let finalStatus = 'pending';

    // Check if admin approved OR specific approver approved - if so, bypass all other approvals
    const isAdminApproval = action === 'approve' && req.user.role === 'admin';
    const isSpecificApproverApproval = action === 'approve' && 
      approvalRule.specificApprovers && 
      approvalRule.specificApprovers.some(specificApproverId => 
        specificApproverId.toString() === req.user._id.toString()
      );
    
    if (isAdminApproval || isSpecificApproverApproval) {
      isComplete = true;
      finalStatus = 'approved';
      // Mark all other pending approvals as approved
      expense.approvals.forEach(approval => {
        if (approval.status === 'pending') {
          approval.status = 'approved';
          approval.comment = isAdminApproval ? 'Auto-approved by admin override' : 'Auto-approved by specific approver';
          approval.approvedAt = new Date();
        }
      });
      console.log('Auto-approval triggered:', isAdminApproval ? 'Admin' : 'Specific Approver');
    } else if (rejectedCount > 0) {
      // Any rejection means rejection
      isComplete = true;
      finalStatus = 'rejected';
    } else if (approvalRule.isSequential) {
      // Sequential approval - check if current approver approved
      if (action === 'approve') {
        const currentIndex = expense.approvals.findIndex(
          a => a.approver.toString() === req.user._id.toString()
        );
        console.log('Current approver index:', currentIndex, 'Total approvers:', totalApprovers);
        console.log('Current approver ID:', req.user._id, 'Role:', req.user.role);
        
        if (currentIndex < totalApprovers - 1) {
          // Move to next approver
          expense.currentApprover = expense.approvals[currentIndex + 1].approver;
          console.log('Moving to next approver:', expense.currentApprover);
        } else {
          // All sequential approvers approved
          isComplete = true;
          finalStatus = 'approved';
          console.log('All sequential approvers approved');
        }
      }
    } else {
      // Advanced approval rules: Percentage, Specific Approver, or Hybrid
      console.log('Checking advanced approval rules...');
      console.log('Approval rule:', {
        minimumApprovalPercentage: approvalRule.minimumApprovalPercentage,
        specificApprovers: approvalRule.specificApprovers,
        isSequential: approvalRule.isSequential
      });
      
      // Check if specific approver approved (auto-approval)
      const specificApproverApproved = approvalRule.specificApprovers && 
        approvalRule.specificApprovers.some(specificApproverId => 
          expense.approvals.some(approval => 
            approval.approver.toString() === specificApproverId.toString() && 
            approval.status === 'approved'
          )
        );
      
      // Check percentage rule
      const approvalPercentage = (approvedCount / totalApprovers) * 100;
      const percentageMet = approvalPercentage >= approvalRule.minimumApprovalPercentage;
      
      console.log('Specific approver approved:', specificApproverApproved);
      console.log('Percentage met:', percentageMet, `(${approvalPercentage}% >= ${approvalRule.minimumApprovalPercentage}%)`);
      
      // Hybrid rule: 60% OR specific approver approves
      if (approvalRule.specificApprovers && approvalRule.specificApprovers.length > 0) {
        // Hybrid rule: percentage OR specific approver
        if (percentageMet || specificApproverApproved) {
          isComplete = true;
          finalStatus = 'approved';
          console.log('Hybrid rule satisfied: percentage OR specific approver');
        }
      } else {
        // Pure percentage rule
        if (percentageMet) {
          isComplete = true;
          finalStatus = 'approved';
          console.log('Percentage rule satisfied');
        }
      }
    }

    if (isComplete) {
      expense.status = finalStatus === 'approved' ? 'approved' : 'rejected';
      expense.finalStatus = finalStatus;
      expense.finalComment = comment;
      expense.currentApprover = null;
      
      if (finalStatus === 'approved') {
        expense.approvedAt = new Date();
      } else {
        expense.rejectedAt = new Date();
      }
    }

    await expense.save();
    
    const populatedExpense = await Expense.findById(expense._id)
      .populate('employee', 'name email')
      .populate('approvals.approver', 'name email');

    res.json(populatedExpense);
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
