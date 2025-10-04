import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Receipt, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Settings,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  Tag
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingApprovals: 0,
    approvedExpenses: 0,
    totalAmount: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [expensesResponse, approvalsResponse] = await Promise.all([
          axios.get('/api/expenses'),
          user.role !== 'employee' ? axios.get('/api/expenses/pending') : Promise.resolve({ data: [] })
        ]);

        const expenses = expensesResponse.data;
        const pendingApprovals = approvalsResponse.data || [];

        const totalExpenses = expenses.length;
        const approvedExpenses = expenses.filter(e => e.status === 'approved').length;
        const totalAmount = expenses
          .filter(e => e.status === 'approved')
          .reduce((sum, e) => sum + e.convertedAmount, 0);

        setStats({
          totalExpenses,
          pendingApprovals: pendingApprovals.length,
          approvedExpenses,
          totalAmount
        });

        setRecentExpenses(expenses.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleBasedMessage = () => {
    switch (user?.role) {
      case 'admin':
        return 'Manage your organization\'s expenses and approvals.';
      case 'manager':
        return 'Review and approve expense claims from your team.';
      case 'employee':
        return 'Track and submit your expense claims.';
      default:
        return 'Here\'s your expense overview.';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <img 
          src="/logo.png" 
          alt="Expense Manager Logo" 
          className="h-12 w-12 object-contain mb-4"
        />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900"> {getGreeting()}, {user?.name || 'User'}</h1>
              <p className="mt-2 text-gray-600">
                {getRoleBasedMessage()}
              </p>
            </div>
            {user.role === 'employee' && (
              <Link
                to="/expenses/new"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Expense
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExpenses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedExpenses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalAmount, user.company?.baseCurrency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Expenses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
                  {user.role === 'admin' && (
                    <Link
                      to="/all-expenses"
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center"
                    >
                      View all
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
              <div className="p-6">
                {recentExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {recentExpenses.map((expense) => (
                      <div key={expense._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {expense.description}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {expense.category}
                                </span>
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(expense.expenseDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(expense.convertedAmount, user.company?.baseCurrency)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                            {expense.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Receipt className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                    <p className="text-gray-500 mb-6">Get started by creating your first expense.</p>
                    {user.role === 'employee' && (
                      <Link
                        to="/expenses/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Expense
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {user.role === 'employee' && (
                    <>
                      <Link
                        to="/expenses/new"
                        className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                          <Plus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">New Expense</p>
                          <p className="text-xs text-gray-500">Submit a new expense claim</p>
                        </div>
                      </Link>
                      <Link
                        to="/expenses"
                        className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mr-4">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">My Expenses</p>
                          <p className="text-xs text-gray-500">View all your expenses</p>
                        </div>
                      </Link>
                    </>
                  )}

                  {(user.role === 'manager' || user.role === 'admin') && (
                    <Link
                      to="/approvals"
                      className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mr-4">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Approvals</p>
                        <p className="text-xs text-gray-500">Review pending approvals</p>
                      </div>
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <>
                      <Link
                        to="/all-expenses"
                        className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                          <Receipt className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">All Expenses</p>
                          <p className="text-xs text-gray-500">View all company expenses</p>
                        </div>
                      </Link>
                      <Link
                        to="/users"
                        className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Users</p>
                          <p className="text-xs text-gray-500">Manage user accounts</p>
                        </div>
                      </Link>
                      <Link
                        to="/approval-rules"
                        className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mr-4">
                          <Settings className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Rules</p>
                          <p className="text-xs text-gray-500">Configure approval rules</p>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
