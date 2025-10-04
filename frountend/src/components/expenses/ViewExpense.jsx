import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../../config/env';
import { 
  X,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Edit,
  Trash2
} from 'lucide-react';

const ViewExpense = ({ expenseId, isOpen, onClose, onEdit, onDelete }) => {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && expenseId) {
      fetchExpense();
    }
  }, [isOpen, expenseId]);

  const fetchExpense = async () => {
    try {
      const response = await axios.get(`/api/expenses/${expenseId}`);
      setExpense(response.data);
    } catch (error) {
      toast.error('Failed to fetch expense details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    onEdit(expenseId);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/api/expenses/${expenseId}`);
        toast.success('Expense deleted successfully');
        onDelete(expenseId);
        onClose();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'waiting_approval':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'submitted':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'waiting_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-20 bg-opacity-10 backdrop-blur-sm transition-opacity shadow-lg" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expense Details</h1>
              <p className="text-gray-600">View and manage expense information</p>
            </div>
            
            <div className="flex items-center space-x-3">
              
             
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            ) : !expense ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">Expense not found</h3>
                <p className="text-gray-500">The expense you're looking for doesn't exist.</p>
              </div>
            ) : (
              <>

      {/* Profile Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{expense.description}</h2>
            <p className="text-lg text-gray-600">{expense.category}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                {getStatusIcon(expense.status)}
                <span className="ml-1">{expense.status.replace('_', ' ')}</span>
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                Applied {new Date(expense.expenseDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Expense Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatCurrency(expense.convertedAmount, 'USD')}
                  {expense.currency !== 'USD' && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({formatCurrency(expense.amount, expense.currency)})
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Tag className="h-4 w-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-sm font-medium text-gray-900">{expense.category}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Expense Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(expense.expenseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Building className="h-4 w-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="text-sm font-medium text-gray-900">{expense.paidBy || 'Cash'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Approval Status</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                  {expense.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Submitted By</p>
                <p className="text-sm font-medium text-gray-900">{expense.employee?.name || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Created Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(expense.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {expense.notes && (
              <div className="flex items-start">
                <FileText className="h-4 w-4 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm font-medium text-gray-900">{expense.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Receipt & Documents</h3>
          </div>
        </div>
        
        {expense.receipt ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Receipt</p>
                 
                </div>
              </div>
              <button
                onClick={() => window.open(`${API_URL}/uploads/receipts/${expense.receipt.filename}`, '_blank')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
               
                View Document
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
            <p className="mt-1 text-sm text-gray-500">No receipt or supporting documents available.</p>
          </div>
        )}
      </div>

      {/* Approval Progress */}
      {expense.status === 'waiting_approval' && expense.approvals && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Approval Progress</h3>
          </div>
          
          <div className="space-y-3">
            {expense.approvals
              .filter(approval => approval.approver?.isActive !== false)
              .map((approval, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  approval.status === 'approved' ? 'bg-green-500' :
                  approval.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {approval.approver?.name || 'Unknown Approver'}
                  </p>
                  <p className={`text-xs ${
                    approval.status === 'approved' ? 'text-green-600' :
                    approval.status === 'rejected' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {approval.status === 'approved' ? 'Approved' :
                     approval.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExpense;
