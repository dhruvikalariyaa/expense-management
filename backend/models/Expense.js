const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Accommodation', 'Transport', 'Office Supplies', 'Entertainment', 'Other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  convertedAmount: {
    type: Number,
    required: true
  },
  expenseDate: {
    type: Date,
    required: true
  },
  paidBy: {
    type: String,
    required: true,
    trim: true
  },
  receipt: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'waiting_approval', 'approved', 'rejected'],
    default: 'draft'
  },
  approvalRule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalRule'
  },
  approvals: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comment: String,
    approvedAt: Date
  }],
  currentApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  finalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  finalComment: String,
  approvedAt: Date,
  rejectedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
