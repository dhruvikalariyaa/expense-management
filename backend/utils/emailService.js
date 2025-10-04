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

// Base email template with professional styling
const getBaseEmailTemplate = (title, content, actionButton = null) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
            Expense Management System
          </h1>
          <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">
            Professional Expense Tracking & Approval
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          ${content}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
          <div style="text-align: center;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
              This is an automated message from the Expense Management System
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Expense Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Professional button component
const getButton = (text, link, variant = 'primary') => {
  const colors = {
    primary: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
    success: 'background: linear-gradient(135deg, #10b981 0%, #059669 100%);',
    danger: 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);',
    warning: 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);'
  };
  
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${link}" 
         style="${colors[variant]} color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
        ${text}
      </a>
    </div>
  `;
};

// Info card component
const getInfoCard = (title, items, type = 'info') => {
  const colors = {
    info: 'border-left: 4px solid #3b82f6; background-color: #eff6ff;',
    success: 'border-left: 4px solid #10b981; background-color: #ecfdf5;',
    warning: 'border-left: 4px solid #f59e0b; background-color: #fffbeb;',
    danger: 'border-left: 4px solid #ef4444; background-color: #fef2f2;'
  };
  
  const itemsHtml = items.map(item => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span style="font-weight: 600; color: #374151;">${item.label}:</span>
      <span style="color: #6b7280;">${item.value}</span>
    </div>
  `).join('');
  
  return `
    <div style="${colors[type]} padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">${title}</h3>
      ${itemsHtml}
    </div>
  `;
};

// Send password email with professional design
const sendPasswordEmail = async (userEmail, userName, password) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
        Welcome to Expense Management System! 🎉
      </h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${userName}</strong>,
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        Your account has been successfully created! You can now access the Expense Management System using the credentials below:
      </p>
      
      ${getInfoCard('Login Credentials', [
        { label: 'Email Address', value: userEmail },
        { label: 'Temporary Password', value: `<code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code>` }
      ], 'info')}
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">
          🔒 Security Notice
        </p>
        <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">
          For your security, please change your password immediately after your first login. You can use the "Forgot Password" feature anytime to reset your password.
        </p>
      </div>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
        If you have any questions or need assistance, please don't hesitate to contact our support team.
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
        Best regards,<br>
        <strong>Expense Management Team</strong>
      </p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to Expense Management System - Your Account is Ready!',
      html: getBaseEmailTemplate('Welcome to Expense Management System', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send forgot password email with professional design
const sendForgotPasswordEmail = async (userEmail, userName, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const content = `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
        Password Reset Request 🔐
      </h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${userName}</strong>,
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        We received a request to reset your password for your Expense Management System account. Click the button below to create a new password:
      </p>
      
      ${getButton('Reset My Password', resetLink, 'primary')}
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; color: #374151; font-weight: 600; font-size: 14px;">
          Alternative Method:
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 14px; word-break: break-all;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetLink}" style="color: #667eea; text-decoration: underline;">${resetLink}</a>
        </p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">
          ⏰ Important Security Information
        </p>
        <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">
          This password reset link will expire in 24 hours for security reasons. If you don't reset your password within this time, you'll need to request a new reset link.
        </p>
      </div>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ef4444;">
        <p style="margin: 0; color: #dc2626; font-weight: 600;">
          🚨 Security Alert
        </p>
        <p style="margin: 8px 0 0 0; color: #dc2626; font-size: 14px;">
          If you did not request this password reset, please contact your administrator immediately. Your account may be compromised.
        </p>
      </div>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
        Best regards,<br>
        <strong>Expense Management Team</strong>
      </p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Password Reset Request - Expense Management System',
      html: getBaseEmailTemplate('Password Reset Request', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send expense submission notification
const sendExpenseSubmissionEmail = async (userEmail, userName, expenseData) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
        Expense Submitted Successfully! 📋
      </h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${userName}</strong>,
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        Your expense has been successfully submitted and is now pending approval. Here are the details:
      </p>
      
      ${getInfoCard('Expense Details', [
        { label: 'Description', value: expenseData.description },
        { label: 'Category', value: expenseData.category },
        { label: 'Amount', value: `${expenseData.currency} ${expenseData.amount.toFixed(2)}` },
        { label: 'Expense Date', value: new Date(expenseData.expenseDate).toLocaleDateString() },
        { label: 'Paid By', value: expenseData.paidBy },
        { label: 'Status', value: 'Pending Approval' }
      ], 'info')}
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
        <p style="margin: 0; color: #065f46; font-weight: 600;">
          ✅ What happens next?
        </p>
        <p style="margin: 8px 0 0 0; color: #065f46; font-size: 14px;">
          Your expense will be reviewed by the appropriate approvers according to your company's approval workflow. You'll receive notifications about any status changes.
        </p>
      </div>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
        You can track the status of your expense in the Expense Management System dashboard.
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
        Best regards,<br>
        <strong>Expense Management Team</strong>
      </p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Expense Submitted - ${expenseData.description} (${expenseData.currency} ${expenseData.amount})`,
      html: getBaseEmailTemplate('Expense Submitted', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send expense approval notification
const sendExpenseApprovalEmail = async (userEmail, userName, expenseData, approverName) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
        Expense Approved! ✅
      </h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${userName}</strong>,
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        Great news! Your expense has been approved by <strong>${approverName}</strong>. Here are the details:
      </p>
      
      ${getInfoCard('Approved Expense Details', [
        { label: 'Description', value: expenseData.description },
        { label: 'Category', value: expenseData.category },
        { label: 'Amount', value: `${expenseData.currency} ${expenseData.amount.toFixed(2)}` },
        { label: 'Expense Date', value: new Date(expenseData.expenseDate).toLocaleDateString() },
        { label: 'Approved By', value: approverName },
        { label: 'Approved At', value: new Date().toLocaleString() },
        { label: 'Status', value: 'Approved' }
      ], 'success')}
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
        <p style="margin: 0; color: #065f46; font-weight: 600;">
          💰 Reimbursement Information
        </p>
        <p style="margin: 8px 0 0 0; color: #065f46; font-size: 14px;">
          Your expense has been approved and will be processed for reimbursement according to your company's payment schedule.
        </p>
      </div>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
        Thank you for using the Expense Management System!
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
        Best regards,<br>
        <strong>Expense Management Team</strong>
      </p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Expense Approved - ${expenseData.description} (${expenseData.currency} ${expenseData.amount})`,
      html: getBaseEmailTemplate('Expense Approved', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send expense rejection notification
const sendExpenseRejectionEmail = async (userEmail, userName, expenseData, approverName, rejectionReason) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
        Expense Requires Attention ⚠️
      </h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${userName}</strong>,
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        Your expense has been reviewed by <strong>${approverName}</strong> and requires attention. Here are the details:
      </p>
      
      ${getInfoCard('Expense Details', [
        { label: 'Description', value: expenseData.description },
        { label: 'Category', value: expenseData.category },
        { label: 'Amount', value: `${expenseData.currency} ${expenseData.amount.toFixed(2)}` },
        { label: 'Expense Date', value: new Date(expenseData.expenseDate).toLocaleDateString() },
        { label: 'Reviewed By', value: approverName },
        { label: 'Status', value: 'Rejected' }
      ], 'danger')}
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ef4444;">
        <p style="margin: 0; color: #dc2626; font-weight: 600;">
          📝 Reason for Rejection
        </p>
        <p style="margin: 8px 0 0 0; color: #dc2626; font-size: 14px;">
          ${rejectionReason || 'No specific reason provided. Please contact the approver for more details.'}
        </p>
      </div>
      
      <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; color: #1e40af; font-weight: 600;">
          🔄 Next Steps
        </p>
        <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 14px;">
          You can resubmit this expense with the necessary corrections or contact the approver for clarification. If you believe this rejection was made in error, please reach out to your manager.
        </p>
      </div>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
        If you have any questions, please don't hesitate to contact us.
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
        Best regards,<br>
        <strong>Expense Management Team</strong>
      </p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Expense Requires Attention - ${expenseData.description} (${expenseData.currency} ${expenseData.amount})`,
      html: getBaseEmailTemplate('Expense Requires Attention', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send approval request notification to approvers
const sendApprovalRequestEmail = async (approverEmail, approverName, expenseData, employeeName) => {
  try {
    const transporter = createTransporter();
    
    const approvalLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/approvals`;
    
    const content = `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
        New Expense Approval Request 📋
      </h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${approverName}</strong>,
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        You have a new expense approval request from <strong>${employeeName}</strong> that requires your review:
      </p>
      
      ${getInfoCard('Expense Details', [
        { label: 'Employee', value: employeeName },
        { label: 'Description', value: expenseData.description },
        { label: 'Category', value: expenseData.category },
        { label: 'Amount', value: `${expenseData.currency} ${expenseData.amount.toFixed(2)}` },
        { label: 'Expense Date', value: new Date(expenseData.expenseDate).toLocaleDateString() },
        { label: 'Paid By', value: expenseData.paidBy },
        { label: 'Submitted At', value: new Date(expenseData.createdAt).toLocaleString() }
      ], 'info')}
      
      ${getButton('Review & Approve', approvalLink, 'primary')}
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">
          ⏰ Action Required
        </p>
        <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">
          Please review this expense as soon as possible. The employee is waiting for your decision to proceed with their reimbursement.
        </p>
      </div>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
        You can also access all pending approvals through the Expense Management System dashboard.
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
        Best regards,<br>
        <strong>Expense Management Team</strong>
      </p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: approverEmail,
      subject: `Approval Required - ${expenseData.description} by ${employeeName} (${expenseData.currency} ${expenseData.amount})`,
      html: getBaseEmailTemplate('Approval Request', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send expense reminder email
const sendExpenseReminderEmail = async (userEmail, userName, pendingExpenses) => {
  try {
    const transporter = createTransporter();
    
    const dashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
    
    const expensesList = pendingExpenses.map(expense => `
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 3px solid #3b82f6;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="margin: 0; font-weight: 600; color: #1f2937;">${expense.description}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">${expense.category} • ${expense.currency} ${expense.amount.toFixed(2)}</p>
          </div>
          <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
            ${expense.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
    `).join('');
    
    const content = `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
        Expense Reminder 📅
      </h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${userName}</strong>,
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        This is a friendly reminder that you have <strong>${pendingExpenses.length}</strong> expense(s) that require your attention:
      </p>
      
      ${expensesList}
      
      ${getButton('View Dashboard', dashboardLink, 'primary')}
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
        <p style="margin: 0; color: #065f46; font-weight: 600;">
          💡 Quick Tips
        </p>
        <p style="margin: 8px 0 0 0; color: #065f46; font-size: 14px;">
          • Submit your expenses promptly to ensure timely reimbursement<br>
          • Keep your receipts organized for easy submission<br>
          • Contact support if you need help with any expense
        </p>
      </div>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
        Thank you for using the Expense Management System!
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
        Best regards,<br>
        <strong>Expense Management Team</strong>
      </p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Expense Reminder - ${pendingExpenses.length} Pending Expense(s)`,
      html: getBaseEmailTemplate('Expense Reminder', content)
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
  sendForgotPasswordEmail,
  sendExpenseSubmissionEmail,
  sendExpenseApprovalEmail,
  sendExpenseRejectionEmail,
  sendApprovalRequestEmail,
  sendExpenseReminderEmail
};