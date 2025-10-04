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
  MessageSquare
} from 'lucide-react';

const PendingApprovals = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600">Review and approve expense claims from your team</p>
      </div>

      {/* Approvals List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {expenses.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <li key={expense._id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            {expense.employee?.name}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Tag className="h-4 w-4 mr-1" />
                            {expense.category}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {expense.paidBy || 'Cash'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(expense.convertedAmount, 'USD')}
                      </p>
                      {expense.currency !== 'USD' && (
                        <p className="text-xs text-gray-500">
                          {formatCurrency(expense.amount, expense.currency)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const comment = prompt('Add a comment (optional):');
                          handleApproval(expense._id, 'approve', comment);
                        }}
                        disabled={processing === expense._id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {processing === expense._id ? 'Processing...' : 'Approve'}
                      </button>
                      
                      <button
                        onClick={() => {
                          const comment = prompt('Add a rejection reason:');
                          if (comment) {
                            handleApproval(expense._id, 'reject', comment);
                          }
                        }}
                        disabled={processing === expense._id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        {processing === expense._id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Approval Progress */}
                {expense.approvals && expense.approvals.length > 0 && (
                  <div className="mt-3 pl-8">
                    <div className="text-xs text-gray-500 mb-2">Approval Progress:</div>
                    <div className="space-y-1">
                      {expense.approvals.map((approval, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            approval.status === 'approved' ? 'bg-green-500' :
                            approval.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                          <span className="text-xs text-gray-600">
                            {approval.approver?.name || 'Unknown'} - 
                            {approval.status === 'approved' ? ' Approved' :
                             approval.status === 'rejected' ? ' Rejected' : ' Pending'}
                            {approval.comment && (
                              <span className="ml-2 text-gray-500">
                                <MessageSquare className="h-3 w-3 inline mr-1" />
                                {approval.comment}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-1 text-sm text-gray-500">
              All caught up! No expenses are waiting for your approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovals;
