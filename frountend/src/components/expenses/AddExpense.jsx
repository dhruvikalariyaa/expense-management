import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  X,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  User,
  Building,
  Upload,
  Plus
} from 'lucide-react';

const AddExpense = ({ isOpen, onClose, onSuccess, editExpense = null }) => {
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    currency: 'USD',
    paidBy: 'Cash',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [existingReceipt, setExistingReceipt] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [showOcrResults, setShowOcrResults] = useState(false);

  const isEditMode = !!editExpense;

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && editExpense) {
      setFormData({
        description: editExpense.description || '',
        category: editExpense.category || '',
        amount: editExpense.amount || '',
        currency: editExpense.currency || 'USD',
        paidBy: editExpense.paidBy || 'Cash',
        expenseDate: editExpense.expenseDate ? new Date(editExpense.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: editExpense.notes || ''
      });
      setExistingReceipt(editExpense.receipt);
    } else {
      resetForm();
    }
  }, [editExpense, isEditMode]);

  const categories = [
    'Food', 'Travel', 'Accommodation', 'Transport', 
    'Office Supplies', 'Entertainment', 'Other'
  ];

  const currencies = [
    'USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'
  ];

  const paymentMethods = [
    'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const processReceiptWithOCR = async (file) => {
    setOcrProcessing(true);
    setOcrData(null);
    setShowOcrResults(false);
    
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      const response = await axios.post('/api/expenses/process-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { extractedData } = response.data;
      setOcrData(extractedData);
      
      if (extractedData.confidence > 30) {
        // Auto-fill form fields with high confidence data
        setFormData(prev => ({
          ...prev,
          amount: extractedData.amount ? extractedData.amount.toString() : prev.amount,
          currency: extractedData.currency || prev.currency,
          description: extractedData.description || prev.description,
          category: extractedData.category || prev.category,
          expenseDate: extractedData.date || prev.expenseDate
        }));
        
        toast.success('Receipt processed! Fields have been auto-filled.');
        setShowOcrResults(true);
      } else {
        toast.info('Receipt processed but confidence is low. Please review the extracted data.');
        setShowOcrResults(true);
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      toast.error('Failed to process receipt with OCR');
    } finally {
      setOcrProcessing(false);
    }
  };

  const applyOcrData = () => {
    if (ocrData) {
      setFormData(prev => ({
        ...prev,
        amount: ocrData.amount ? ocrData.amount.toString() : prev.amount,
        currency: ocrData.currency || prev.currency,
        description: ocrData.description || prev.description,
        category: ocrData.category || prev.category,
        expenseDate: ocrData.date || prev.expenseDate
      }));
      setShowOcrResults(false);
      toast.success('OCR data applied to form');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setReceipt(file);
      
      // Process with OCR
      await processReceiptWithOCR(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setReceipt(file);
      
      // Process with OCR
      await processReceiptWithOCR(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.category || !formData.amount || !formData.expenseDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('paidBy', formData.paidBy);
      formDataToSend.append('expenseDate', formData.expenseDate);
      if (formData.notes) formDataToSend.append('notes', formData.notes);
      if (receipt) formDataToSend.append('receipt', receipt);

      let response;
      if (isEditMode) {
        response = await axios.put(`/api/expenses/${editExpense._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Expense updated successfully');
      } else {
        response = await axios.post('/api/expenses', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Expense created successfully');
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} expense`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      category: '',
      amount: '',
      currency: 'USD',
      paidBy: 'Cash',
      expenseDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setReceipt(null);
    setExistingReceipt(null);
    setOcrData(null);
    setShowOcrResults(false);
    setOcrProcessing(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto w-full">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 w-full">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Expense' : 'Create New Expense'}
              </h1>
              <p className="text-gray-600">
                {isEditMode ? 'Update the expense details below.' : 'Fill in the details below to submit an expense claim.'}
              </p>
            </div>
            
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter expense description"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Category and Amount Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Currency and Paid By Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Currency in which you spent the money (as per receipt)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid By *
                </label>
                <select
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expense Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Add any additional notes about this expense"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt (Optional)
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="receipt-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept=".png,.jpg,.jpeg,.pdf"
                />
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {ocrProcessing ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    ) : (
                      <DollarSign className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      {ocrProcessing 
                        ? 'Processing receipt...' 
                        : receipt 
                          ? receipt.name 
                          : (existingReceipt ? existingReceipt.originalName || 'Current receipt' : 'Upload a file or drag and drop')
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      {ocrProcessing 
                        ? 'Extracting data with OCR...' 
                        : existingReceipt && !receipt 
                          ? 'Current receipt - upload new file to replace' 
                          : 'PNG, JPG, PDF up to 5MB'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

          

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Expense' : 'Create Expense')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
