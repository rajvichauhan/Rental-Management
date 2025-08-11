import React from 'react';
import { FiClock, FiCheck, FiPlay, FiCheckCircle, FiX, FiArrowRight } from 'react-icons/fi';

const OrderWorkflow = ({ currentStatus, onStatusChange }) => {
  const workflowSteps = [
    { status: 'pending', label: 'Pending', icon: FiClock, color: 'yellow' },
    { status: 'confirmed', label: 'Confirmed', icon: FiCheck, color: 'blue' },
    { status: 'in-progress', label: 'In Progress', icon: FiPlay, color: 'purple' },
    { status: 'completed', label: 'Completed', icon: FiCheckCircle, color: 'green' }
  ];

  const getStepIndex = (status) => {
    return workflowSteps.findIndex(step => step.status === status);
  };

  const currentStepIndex = getStepIndex(currentStatus);

  const getStepColor = (stepIndex, isActive) => {
    if (currentStatus === 'cancelled') {
      return stepIndex === currentStepIndex ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-400';
    }
    
    if (stepIndex < currentStepIndex) {
      return 'bg-green-600 text-white'; // Completed steps
    } else if (stepIndex === currentStepIndex) {
      return isActive ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'; // Current step
    } else {
      return 'bg-gray-300 text-gray-600'; // Future steps
    }
  };

  const canAdvanceToStep = (stepIndex) => {
    return stepIndex === currentStepIndex + 1 || stepIndex === currentStepIndex;
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <h4 className="text-white font-medium mb-4">Order Workflow</h4>
      
      {/* Workflow Steps */}
      <div className="flex items-center justify-between mb-4">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const canAdvance = canAdvanceToStep(index);
          
          return (
            <React.Fragment key={step.status}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => canAdvance && onStatusChange(step.status)}
                  disabled={!canAdvance}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    getStepColor(index, isActive)
                  } ${canAdvance ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                >
                  <Icon className="w-5 h-5" />
                </button>
                <span className={`text-xs mt-2 ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              
              {index < workflowSteps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className={`h-0.5 ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-600'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Cancel Option */}
      {currentStatus !== 'cancelled' && currentStatus !== 'completed' && (
        <div className="pt-4 border-t border-gray-600">
          <button
            onClick={() => onStatusChange('cancelled')}
            className="flex items-center text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            <FiX className="w-4 h-4 mr-1" />
            Cancel Order
          </button>
        </div>
      )}

      {/* Status Actions */}
      <div className="mt-4 space-y-2">
        {currentStatus === 'pending' && (
          <button
            onClick={() => onStatusChange('confirmed')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm transition-colors"
          >
            Confirm Order
          </button>
        )}
        
        {currentStatus === 'confirmed' && (
          <button
            onClick={() => onStatusChange('in-progress')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm transition-colors"
          >
            Start Processing
          </button>
        )}
        
        {currentStatus === 'in-progress' && (
          <button
            onClick={() => onStatusChange('completed')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm transition-colors"
          >
            Mark as Completed
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderWorkflow;
