import React from 'react';
import { FiChevronRight } from 'react-icons/fi';

const RentalWorkflowIndicator = ({ currentStage, onStageChange }) => {
  const stages = [
    { key: 'quotation', label: 'Quotation', color: 'orange' },
    { key: 'quotation-sent', label: 'Quotation sent', color: 'blue' },
    { key: 'rental-order', label: 'Rental Order', color: 'green' }
  ];

  const getStageColor = (stage, isActive) => {
    if (isActive) {
      switch (stage.color) {
        case 'orange':
          return 'bg-orange-600 text-white';
        case 'blue':
          return 'bg-blue-600 text-white';
        case 'green':
          return 'bg-green-600 text-white';
        default:
          return 'bg-gray-600 text-white';
      }
    }
    return 'bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer';
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      {stages.map((stage, index) => (
        <React.Fragment key={stage.key}>
          <button
            onClick={() => onStageChange && onStageChange(stage.key)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              getStageColor(stage, currentStage === stage.key)
            }`}
            disabled={!onStageChange}
          >
            {stage.label}
          </button>
          {index < stages.length - 1 && (
            <FiChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default RentalWorkflowIndicator;
