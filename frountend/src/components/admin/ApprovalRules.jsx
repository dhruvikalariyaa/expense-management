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
    try {
      if (editingRule) {
        await axios.put(`/api/approval-rules/${editingRule._id}`, data);
        toast.success('Approval rule updated successfully');
      } else {
        await axios.post('/api/approval-rules', data);
        toast.success('Approval rule created successfully');
      }
      
      reset();
      setShowForm(false);
      setEditingRule(null);
      fetchRules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save approval rule');
    }
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

  const handleDelete = async (ruleId) => {
    if (window.confirm('Are you sure you want to deactivate this approval rule?')) {
      try {
        await axios.delete(`/api/approval-rules/${ruleId}`);
        toast.success('Approval rule deactivated successfully');
        fetchRules();
      } catch (error) {
        toast.error('Failed to deactivate approval rule');
      }
    }
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRule ? 'Edit Approval Rule' : 'Add New Approval Rule'}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rule Name</label>
                    <input
                      {...register('name', { required: 'Rule name is required' })}
                      type="text"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      {...register('description')}
                      type="text"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    {...register('isManagerApprover')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Include manager as approver
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Approvers</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {users.filter(user => user.isActive !== false).map((user) => (
                      <label key={user._id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedApprovers.includes(user._id)}
                          onChange={(e) => handleApproverChange(user._id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">{user.name}</span>
                      </label>
                    ))}
                  </div>
                  {errors.approvers && (
                    <p className="mt-1 text-sm text-red-600">{errors.approvers.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    {...register('isSequential')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Sequential approval (approvers must approve in order)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Approval Percentage</label>
                  <input
                    {...register('minimumApprovalPercentage', { 
                      required: 'Percentage is required',
                      min: { value: 0, message: 'Percentage must be at least 0' },
                      max: { value: 100, message: 'Percentage must be at most 100' }
                    })}
                    type="number"
                    min="0"
                    max="100"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Percentage of approvers that must approve (e.g., 60 for 60%)
                  </p>
                  {errors.minimumApprovalPercentage && (
                    <p className="mt-1 text-sm text-red-600">{errors.minimumApprovalPercentage.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Specific Approvers (Auto-Approval)
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select users who can auto-approve expenses. If any of these users approve, the expense is automatically approved regardless of percentage.
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {users.filter(user => user.isActive !== false).map((user) => (
                      <label key={user._id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={watch('specificApprovers')?.includes(user._id) || false}
                          onChange={(e) => handleSpecificApproverChange(user._id, e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">{user.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Approval Rule Types:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div><strong>Sequential:</strong> Approvers must approve in order</div>
                    <div><strong>Percentage:</strong> X% of approvers must approve</div>
                    <div><strong>Specific Approver:</strong> Selected users can auto-approve</div>
                    <div><strong>Hybrid:</strong> X% OR specific approver approves</div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingRule ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
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
                      onClick={() => handleDelete(rule._id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Deactivate rule"
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
