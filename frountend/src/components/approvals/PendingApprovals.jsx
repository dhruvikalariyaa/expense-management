import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Calendar,
  Tag,
  User,
  MessageSquare,
  X,
  AlertCircle,
  FileText,
  Building
} from 'lucide-react';

const PendingApprovals = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionType, setActionType] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get('/api/expenses/pending');
      setExpenses(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (expenseId, action, comment = '') => {
    setProcessing(expenseId);
    try {
      await axios.post(`/api/expenses/${expenseId}/approve`, {
        action,
        comment
      });
      
      toast.success(`Expense ${action}d successfully`);
      fetchPendingApprovals();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} expense`);
    } finally {
      setProcessing(null);
    }
  };

  const openCommentModal = (expense, action) => {
    setSelectedExpense(expense);
    setActionType(action);
    setComment('');
    setShowCommentModal(true);
  };

  const handleCommentSubmit = async () => {
    if (selectedExpense) {
      await handleApproval(selectedExpense._id, actionType, comment);
      setShowCommentModal(false);
      setSelectedExpense(null);
      setActionType('');
      setComment('');
    }
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setSelectedExpense(null);
    setActionType('');
    setComment('');
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          </div>
        <div className="flex items-center space-x-2">
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {expenses.length} Pending
          </div>
        </div>
      </div>

      {/* Approvals Grid */}
        {expenses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {expenses.map((expense) => (
            <div key={expense._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {expense.description}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Submitted by {expense.employee?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                    <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(expense.convertedAmount, 'USD')}
                      </p>
                      {expense.currency !== 'USD' && (
                      <p className="text-sm text-gray-500">
                          {formatCurrency(expense.amount, expense.currency)}
                        </p>
                      )}
                    </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Expense Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{expense.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{expense.paidBy || 'Cash'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600 font-medium">Pending Review</span>
                  </div>
                </div>
                
                {/* Approval Progress */}
                {expense.approvals && expense.approvals.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Approval Progress</h4>
                    <div className="space-y-3">
                      {expense.approvals.map((approval, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            approval.status === 'approved' ? 'bg-green-500' :
                            approval.status === 'rejected' ? 'bg-red-500' : 
                            approval.approver?.isActive === false ? 'bg-gray-400' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {approval.approver?.name || 'Unknown'}
                            </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                                approval.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                approval.approver?.isActive === false ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {approval.status === 'approved' ? 'Approved' :
                                 approval.status === 'rejected' ? 'Rejected' : 
                                 approval.approver?.isActive === false ? 'Inactive' : 'Pending'}
                              </span>
                          </div>
                          {approval.comment && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center">
                                <MessageSquare className="h-3 w-3 mr-1" />
                              {approval.comment}
                              </p>
                          )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => openCommentModal(expense, 'approve')}
                    disabled={processing === expense._id}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processing === expense._id ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => openCommentModal(expense, 'reject')}
                    disabled={processing === expense._id}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processing === expense._id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">
              No expenses are waiting for your approval.
            </p>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto w-full">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-gray-20 bg-opacity-30 backdrop-blur-sm transition-opacity" onClick={closeCommentModal}></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4 w-full">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {actionType === 'approve' ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
        )}
      </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {actionType === 'approve' ? 'Approve Expense' : 'Reject Expense'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {actionType === 'approve' 
                        ? 'Add a comment (optional)' 
                        : 'Please provide a reason for rejection'
                      }
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={closeCommentModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment {actionType === 'reject' && '*'}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder={actionType === 'approve' 
                      ? 'Add any additional notes about this approval...' 
                      : 'Please explain why this expense is being rejected...'
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required={actionType === 'reject'}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
                <button
                  type="button"
                  onClick={closeCommentModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCommentSubmit}
                  disabled={actionType === 'reject' && !comment.trim()}
                  className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'} Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
