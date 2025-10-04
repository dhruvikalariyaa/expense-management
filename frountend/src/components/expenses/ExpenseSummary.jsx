import React from 'react';
import { DollarSign, Clock, CheckCircle, Upload, Plus } from 'lucide-react';

const ExpenseSummary = ({ 
  toSubmitAmount = 0, 
  waitingApprovalAmount = 0, 
  approvedAmount = 0,
  onUpload,
  onNewExpense,
  currency = 'USD'
}) => {
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Instructions */}
      

    
      {/* Expense Summary Bar */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          {/* To Submit */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">To Submit</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(toSubmitAmount, currency)}
              </div>
              <div className="text-xs text-gray-500 max-w-32">
                Expenses in draft state not submitted by employee
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Waiting Approval */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Waiting Approval</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(waitingApprovalAmount, currency)}
              </div>
              <div className="text-xs text-gray-500 max-w-32">
                Submitted but not finally approved by matching approval rules
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Approved */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Approved</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(approvedAmount, currency)}
              </div>
              <div className="text-xs text-gray-500 max-w-32">
                Approved according to approval rule
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;
