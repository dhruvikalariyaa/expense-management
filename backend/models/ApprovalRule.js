const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isManagerApprover: {
    type: Boolean,
    default: true
  },
  approvers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isSequential: {
    type: Boolean,
    default: false
  },
  minimumApprovalPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  specificApprovers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);
