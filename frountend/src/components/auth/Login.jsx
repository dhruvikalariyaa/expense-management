import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-lg flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Expense Manager Logo" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>

          <div className="mt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                  <span className="font-semibold">Demo:</span> admin@demo.com / admin123
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="max-w-sm text-center text-white px-6">
          <div className="mb-6">
            <div className="mx-auto h-20 w-20 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm p-3">
              <img 
                src="/logo.png" 
                alt="Expense Manager Logo" 
                className="h-14 w-14 object-contain"
              />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3">Expense Management</h3>
          <p className="text-lg text-blue-100 mb-6">
            Streamline your expense tracking
          </p>
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <div className="h-1.5 w-1.5 bg-white rounded-full mr-3"></div>
              <span className="text-sm">Track expenses in real-time</span>
            </div>
            <div className="flex items-center">
              <div className="h-1.5 w-1.5 bg-white rounded-full mr-3"></div>
              <span className="text-sm">Automated approval workflows</span>
            </div>
            <div className="flex items-center">
              <div className="h-1.5 w-1.5 bg-white rounded-full mr-3"></div>
              <span className="text-sm">Advanced reporting & analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
