import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  Receipt,
  Search,
  Filter,
  Download,
  User,
  Building
} from 'lucide-react';

const AllExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    // Only allow admin users to access this page
    if (user?.role !== 'admin') {
      return;
    }
    fetchExpenses();
  }, [user]);

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

  const filteredAndSortedExpenses = expenses
    .filter(expense => {
      // Status filter
      if (filter !== 'all' && expense.status !== filter) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          expense.description.toLowerCase().includes(searchLower) ||
          expense.category.toLowerCase().includes(searchLower) ||
          expense.user?.name?.toLowerCase().includes(searchLower) ||
          expense.user?.email?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.convertedAmount;
          bValue = b.convertedAmount;
          break;
        case 'date':
          aValue = new Date(a.expenseDate);
          bValue = new Date(b.expenseDate);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.expenseDate);
          bValue = new Date(b.expenseDate);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusCounts = () => {
    return {
      all: expenses.length,
      draft: expenses.filter(e => e.status === 'draft').length,
      waiting_approval: expenses.filter(e => e.status === 'waiting_approval').length,
      approved: expenses.filter(e => e.status === 'approved').length,
      rejected: expenses.filter(e => e.status === 'rejected').length
    };
  };

  const statusCounts = getStatusCounts();

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">Access Denied</div>
          <p className="text-gray-600">Only administrators can view all expenses.</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">All Expenses (Admin View)</h1>
          <p className="text-gray-600">View and manage all expense claims across the organization</p>
        </div>
        {user.role === 'employee' && (
          <Link
            to="/expenses/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { key: 'all', label: 'Total', count: statusCounts.all, color: 'blue' },
          { key: 'draft', label: 'Draft', count: statusCounts.draft, color: 'gray' },
          { key: 'waiting_approval', label: 'Pending', count: statusCounts.waiting_approval, color: 'yellow' },
          { key: 'approved', label: 'Approved', count: statusCounts.approved, color: 'green' },
          { key: 'rejected', label: 'Rejected', count: statusCounts.rejected, color: 'red' }
        ].map((stat) => (
          <div key={stat.key} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-3 h-3 rounded-full bg-${stat.color}-500`}></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-900">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="description">Sort by Description</option>
            <option value="status">Sort by Status</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'draft', label: 'Draft', count: statusCounts.draft },
            { key: 'waiting_approval', label: 'Pending', count: statusCounts.waiting_approval },
            { key: 'approved', label: 'Approved', count: statusCounts.approved },
            { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
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
        {filteredAndSortedExpenses.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredAndSortedExpenses.map((expense) => (
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
                          {expense.user && (
                            <div className="flex items-center text-sm text-gray-500">
                              <User className="h-4 w-4 mr-1" />
                              {expense.user.name || expense.user.email}
                            </div>
                          )}
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
                    </div>
                  </div>
                </div>
                
                {/* Approval Progress */}
                {expense.status === 'waiting_approval' && expense.approvals && (
                  <div className="mt-3 pl-8">
                    <div className="text-xs text-gray-500 mb-2">Approval Progress:</div>
                    <div className="space-y-1">
                      {expense.approvals
                        .filter(approval => approval.approver?.isActive !== false)
                        .map((approval, index) => (
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
                ? 'No expenses have been created yet.'
                : `No expenses with status "${filter.replace('_', ' ')}" found.`
              }
            </p>
            {filter === 'all' && user.role === 'employee' && (
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

      {/* Summary Footer */}
      {filteredAndSortedExpenses.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredAndSortedExpenses.length} of {expenses.length} expenses
            </div>
            <div className="text-sm font-medium text-gray-900">
              Total Amount: {formatCurrency(
                filteredAndSortedExpenses
                  .filter(e => e.status === 'approved')
                  .reduce((sum, e) => sum + e.convertedAmount, 0)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllExpenses;