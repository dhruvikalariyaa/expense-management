const express = require('express');
const ApprovalRule = require('../models/ApprovalRule');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get approval rules for company
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const rules = await ApprovalRule.find({
      company: req.user.company._id,
      isActive: true
    }).populate('approvers specificApprovers', 'name email role');

    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create approval rule
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      description,
      isManagerApprover,
      approvers,
      isSequential,
      minimumApprovalPercentage,
      specificApprovers
    } = req.body;

    // Deactivate existing rules
    await ApprovalRule.updateMany(
      { company: req.user.company._id },
      { isActive: false }
    );

    const rule = new ApprovalRule({
      company: req.user.company._id,
      name,
      description,
      isManagerApprover,
      approvers,
      isSequential,
      minimumApprovalPercentage,
      specificApprovers: specificApprovers || []
    });

    await rule.save();
    
    const populatedRule = await ApprovalRule.findById(rule._id)
      .populate('approvers specificApprovers', 'name email role');

    res.status(201).json(populatedRule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update approval rule
router.put('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      description,
      isManagerApprover,
      approvers,
      isSequential,
      minimumApprovalPercentage,
      specificApprovers
    } = req.body;

    const rule = await ApprovalRule.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id },
      {
        name,
        description,
        isManagerApprover,
        approvers,
        isSequential,
        minimumApprovalPercentage,
        specificApprovers: specificApprovers || []
      },
      { new: true }
    ).populate('approvers specificApprovers', 'name email role');

    if (!rule) {
      return res.status(404).json({ message: 'Approval rule not found' });
    }

    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete approval rule
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const rule = await ApprovalRule.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id },
      { isActive: false },
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({ message: 'Approval rule not found' });
    }

    res.json({ message: 'Approval rule deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
