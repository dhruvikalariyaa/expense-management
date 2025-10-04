import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Calendar,
  Tag,
  FileText,
  Receipt
} from 'lucide-react';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('/api/expenses');
      setExpenses(response.data);
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExpense = async (expenseId) => {
    try {
      await axios.post(`/api/expenses/${expenseId}/submit`);
      toast.success('Expense submitted for approval');
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit expense');
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
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'waiting_approval':
        return 'text-yellow-600 bg-yellow-100';
      case 'submitted':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true;
    return expense.status === filter;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
          <p className="text-gray-600">Manage and track your expense claims</p>
        </div>
        <Link
          to="/expenses/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Expense
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All', count: expenses.length },
            { key: 'draft', label: 'Draft', count: expenses.filter(e => e.status === 'draft').length },
            { key: 'waiting_approval', label: 'Pending', count: expenses.filter(e => e.status === 'waiting_approval').length },
            { key: 'approved', label: 'Approved', count: expenses.filter(e => e.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: expenses.filter(e => e.status === 'rejected').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Expenses List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredExpenses.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <li key={expense._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(expense.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {expense.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
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
                          {expense.receipt && (
                            <div className="flex items-center text-sm text-gray-500">
                              <FileText className="h-4 w-4 mr-1" />
                              Receipt attached
                            </div>
                          )}
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
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                      {expense.status.replace('_', ' ')}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {/* View details */}}
                        className="text-gray-400 hover:text-gray-600"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {expense.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitExpense(expense._id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Approval Progress */}
                {expense.status === 'waiting_approval' && expense.approvals && (
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
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'Get started by creating a new expense.'
                : `No expenses with status "${filter.replace('_', ' ')}" found.`
              }
            </p>
            {filter === 'all' && (
              <div className="mt-6">
                <Link
                  to="/expenses/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Expense
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
