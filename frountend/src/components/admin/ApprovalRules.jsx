import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Users,
  CheckCircle,
  Percent
} from 'lucide-react';

const ApprovalRules = () => {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [formData, setFormData] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      description: '',
      isManagerApprover: true,
      approvers: [],
      isSequential: false,
      minimumApprovalPercentage: 100,
      specificApprovers: []
    }
  });

  const selectedApprovers = watch('approvers') || [];

  useEffect(() => {
    fetchRules();
    fetchUsers();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await axios.get('/api/approval-rules');
      setRules(response.data);
    } catch (error) {
      toast.error('Failed to fetch approval rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const onSubmit = async (data) => {
    if (editingRule) {
      // Direct update for existing rules
      try {
        await axios.put(`/api/approval-rules/${editingRule._id}`, data);
        toast.success('Approval rule updated successfully');
        reset();
        setShowForm(false);
        setEditingRule(null);
        fetchRules();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to save approval rule');
      }
    } else {
      // Show confirmation for new rules
      setFormData(data);
      setShowCreateConfirm(true);
    }
  };

  const confirmCreate = async () => {
    if (formData) {
      try {
        await axios.post('/api/approval-rules', formData);
        toast.success('New approval rule created and previous rules deactivated');
        reset();
        setShowForm(false);
        setEditingRule(null);
        setShowCreateConfirm(false);
        setFormData(null);
        fetchRules();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to save approval rule');
      }
    }
  };

  const cancelCreate = () => {
    setShowCreateConfirm(false);
    setFormData(null);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setValue('name', rule.name);
    setValue('description', rule.description);
    setValue('isManagerApprover', rule.isManagerApprover);
    setValue('approvers', rule.approvers.map(a => a._id));
    setValue('isSequential', rule.isSequential);
    setValue('minimumApprovalPercentage', rule.minimumApprovalPercentage);
    setValue('specificApprovers', rule.specificApprovers.map(a => a._id));
    setShowForm(true);
  };

  const handleDelete = (rule) => {
    setRuleToDelete(rule);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (ruleToDelete) {
      try {
        await axios.delete(`/api/approval-rules/${ruleToDelete._id}`);
        toast.success('Approval rule deactivated successfully');
        fetchRules();
        setShowDeleteConfirm(false);
        setRuleToDelete(null);
      } catch (error) {
        toast.error('Failed to deactivate approval rule');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRuleToDelete(null);
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setEditingRule(null);
  };

  const handleApproverChange = (userId, checked) => {
    const currentApprovers = selectedApprovers;
    if (checked) {
      setValue('approvers', [...currentApprovers, userId]);
    } else {
      setValue('approvers', currentApprovers.filter(id => id !== userId));
    }
  };

  const handleSpecificApproverChange = (userId, checked) => {
    const currentSpecificApprovers = watch('specificApprovers') || [];
    if (checked) {
      setValue('specificApprovers', [...currentSpecificApprovers, userId]);
    } else {
      setValue('specificApprovers', currentSpecificApprovers.filter(id => id !== userId));
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Approval Rules</h1>
          <p className="text-gray-600">Configure expense approval workflows and rules</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </button>
      </div>

      {/* Rule Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto w-full">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-gray-20 bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)}></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4 w-full">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Settings className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {editingRule ? 'Edit Approval Rule' : 'Add New Approval Rule'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {editingRule ? 'Update the approval rule configuration' : 'Configure a new expense approval workflow'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-blue-600" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name *</label>
                      <input
                        {...register('name', { required: 'Rule name is required' })}
                        type="text"
                        placeholder="Enter rule name (e.g., High Value Expenses)"
                        className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        {...register('description')}
                        type="text"
                        placeholder="Brief description of the rule"
                        className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Approval Configuration Section */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Approval Configuration
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                      <input
                        {...register('isManagerApprover')}
                        type="checkbox"
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label className="text-sm font-medium text-gray-900">
                          Include manager as approver
                        </label>
                        <p className="text-sm text-gray-500">Automatically include the employee's direct manager in the approval process</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Select Approvers *</label>
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                          {users.filter(user => user.isActive !== false).map((user) => (
                            <label key={user._id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedApprovers.includes(user._id)}
                                onChange={(e) => handleApproverChange(user._id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-3 text-sm font-medium text-gray-900">{user.name}</span>
                            </label>
                          ))}
                        </div>
                        {selectedApprovers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              <strong>{selectedApprovers.length}</strong> approver{selectedApprovers.length !== 1 ? 's' : ''} selected
                            </p>
                          </div>
                        )}
                      </div>
                      {errors.approvers && (
                        <p className="mt-2 text-sm text-red-600">{errors.approvers.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Approval Flow Settings Section */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Approval Flow Settings
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                      <input
                        {...register('isSequential')}
                        type="checkbox"
                        className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label className="text-sm font-medium text-gray-900">
                          Sequential approval
                        </label>
                        <p className="text-sm text-gray-500">Approvers must approve in a specific order (first approver must approve before second, etc.)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Approval Percentage *</label>
                        <div className="relative">
                          <input
                            {...register('minimumApprovalPercentage', { 
                              required: 'Percentage is required',
                              min: { value: 0, message: 'Percentage must be at least 0' },
                              max: { value: 100, message: 'Percentage must be at most 100' }
                            })}
                            type="number"
                            min="0"
                            max="100"
                            placeholder="e.g., 60"
                            className="block w-full rounded-lg border border-gray-300 py-3 px-4 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">%</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Percentage of approvers that must approve (e.g., 60 for 60%)
                        </p>
                        {errors.minimumApprovalPercentage && (
                          <p className="mt-2 text-sm text-red-600">{errors.minimumApprovalPercentage.message}</p>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Approval Examples</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>• <strong>50%:</strong> Half of approvers must approve</div>
                          <div>• <strong>100%:</strong> All approvers must approve</div>
                          <div>• <strong>Sequential:</strong> Must approve in order</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auto-Approval Section */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
                    Auto-Approval Settings
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Specific Approvers (Auto-Approval)</h5>
                      <p className="text-sm text-gray-500 mb-4">
                        Select users who can auto-approve expenses. If any of these users approve, the expense is automatically approved regardless of percentage.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                          {users.filter(user => user.isActive !== false).map((user) => (
                            <label key={user._id} className="flex items-center p-3 hover:bg-white rounded-lg cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={watch('specificApprovers')?.includes(user._id) || false}
                                onChange={(e) => handleSpecificApproverChange(user._id, e.target.checked)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <span className="ml-3 text-sm font-medium text-gray-900">{user.name}</span>
                            </label>
                          ))}
                        </div>
                        {watch('specificApprovers')?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              <strong>{watch('specificApprovers').length}</strong> auto-approver{watch('specificApprovers').length !== 1 ? 's' : ''} selected
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-amber-800">
                        Important Notice
                      </h4>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          <strong>Creating a new approval rule will automatically deactivate all existing rules.</strong> 
                          Only one approval rule can be active at a time for your company.
                        </p>
                        <p className="mt-2">
                          If you need to modify an existing rule, use the edit button instead of creating a new one.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-blue-600" />
                    Approval Rule Types
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">Sequential</div>
                          <div className="text-sm text-blue-700">Approvers must approve in order</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">Percentage</div>
                          <div className="text-sm text-blue-700">X% of approvers must approve</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">Auto-Approval</div>
                          <div className="text-sm text-blue-700">Selected users can auto-approve</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">Hybrid</div>
                          <div className="text-sm text-blue-700">X% OR specific approver approves</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto w-full">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-gray-20 bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={cancelDelete}></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4 w-full">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Delete Approval Rule
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-red-800">
                          Are you sure you want to delete this approval rule?
                        </h4>
                        <div className="mt-2 text-sm text-red-700">
                          <p><strong>Rule Name:</strong> {ruleToDelete?.name}</p>
                          {ruleToDelete?.description && (
                            <p><strong>Description:</strong> {ruleToDelete.description}</p>
                          )}
                          <p className="mt-2">
                            This will permanently deactivate the rule and it cannot be recovered.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Rule Details:</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• <strong>Approvers:</strong> {ruleToDelete?.approvers?.filter(approver => approver.isActive !== false).length || 0}</div>
                      <div>• <strong>Required:</strong> {ruleToDelete?.minimumApprovalPercentage}%</div>
                      {ruleToDelete?.isSequential && (
                        <div>• <strong>Type:</strong> Sequential approval</div>
                      )}
                      {ruleToDelete?.isManagerApprover && (
                        <div>• <strong>Manager:</strong> Included as approver</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 rounded-b-xl bg-gray-50">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4 inline mr-2" />
                  Delete Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Confirmation Modal */}
      {showCreateConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto w-full">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-gray-20 bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={cancelCreate}></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4 w-full">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Create New Approval Rule
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      This will deactivate existing rules
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-amber-800">
                          Important: Existing Rules Will Be Deactivated
                        </h4>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>
                            Creating this new approval rule will automatically deactivate all existing approval rules for your company.
                          </p>
                          <p className="mt-2">
                            <strong>Rule Name:</strong> {formData?.name}
                          </p>
                          {formData?.description && (
                            <p><strong>Description:</strong> {formData.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">New Rule Details:</h5>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>• <strong>Approvers:</strong> {formData?.approvers?.length || 0} selected</div>
                      <div>• <strong>Required:</strong> {formData?.minimumApprovalPercentage}% approval</div>
                      {formData?.isSequential && (
                        <div>• <strong>Type:</strong> Sequential approval</div>
                      )}
                      {formData?.isManagerApprover && (
                        <div>• <strong>Manager:</strong> Included as approver</div>
                      )}
                      {formData?.specificApprovers?.length > 0 && (
                        <div>• <strong>Auto-approvers:</strong> {formData.specificApprovers.length} selected</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Current Active Rules:</h5>
                    <div className="text-sm text-gray-600">
                      {rules.length > 0 ? (
                        <div className="space-y-1">
                          {rules.map((rule, index) => (
                            <div key={rule._id} className="flex items-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                              <span>{rule.name} (will be deactivated)</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No existing rules to deactivate</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 rounded-b-xl bg-gray-50">
                <button
                  onClick={cancelCreate}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCreate}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Settings className="h-4 w-4 inline mr-2" />
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Approval Rules</h3>
        </div>
        
        {rules.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {rules.map((rule) => (
              <li key={rule._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {rule.name}
                        </p>
                        {rule.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {rule.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-1" />
                            {rule.approvers.filter(approver => approver.isActive !== false).length} approvers
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Percent className="h-4 w-4 mr-1" />
                            {rule.minimumApprovalPercentage}% required
                          </div>
                          {rule.isSequential && (
                            <div className="flex items-center text-sm text-gray-500">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Sequential
                            </div>
                          )}
                          {rule.isManagerApprover && (
                            <div className="flex items-center text-sm text-gray-500">
                              Manager included
                            </div>
                          )}
                        </div>
                        
                        {/* Rule Type Display */}
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2">
                            {rule.isSequential ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Sequential Approval
                              </span>
                            ) : rule.specificApprovers && rule.specificApprovers.filter(approver => approver.isActive !== false).length > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Hybrid: {rule.minimumApprovalPercentage}% OR {rule.specificApprovers.filter(approver => approver.isActive !== false).length} specific approver(s)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Percentage: {rule.minimumApprovalPercentage}% required
                              </span>
                            )}
                          </div>
                          
                          {rule.specificApprovers && rule.specificApprovers.filter(approver => approver.isActive !== false).length > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              Auto-approvers: {rule.specificApprovers.filter(approver => approver.isActive !== false).map(approver => approver.name).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit rule"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No approval rules found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new approval rule.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalRules;
