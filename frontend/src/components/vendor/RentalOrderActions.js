import React from 'react';
import {
  FiSend,
  FiPrinter,
  FiCheck,
  FiX,
  FiPlus,
  FiSave,
  FiMail,
  FiDownload
} from 'react-icons/fi';

const RentalOrderActions = ({ 
  onSend, 
  onPrint, 
  onConfirm, 
  onCancel, 
  onSave,
  onEmailCustomer,
  onExportPDF,
  workflowStage,
  disabled = false 
}) => {
  
  const getAvailableActions = () => {
    switch (workflowStage) {
      case 'quotation':
        return ['save', 'send', 'print', 'cancel'];
      case 'quotation-sent':
        return ['confirm', 'print', 'email', 'cancel'];
      case 'rental-order':
        return ['print', 'export', 'email', 'cancel'];
      default:
        return ['save', 'print', 'cancel'];
    }
  };

  const availableActions = getAvailableActions();

  const actionButtons = {
    save: {
      icon: FiSave,
      label: 'Save',
      onClick: onSave,
      className: 'bg-blue-600 hover:bg-blue-700'
    },
    send: {
      icon: FiSend,
      label: 'Send',
      onClick: onSend,
      className: 'bg-green-600 hover:bg-green-700'
    },
    print: {
      icon: FiPrinter,
      label: 'Print',
      onClick: onPrint,
      className: 'bg-gray-700 hover:bg-gray-600'
    },
    confirm: {
      icon: FiCheck,
      label: 'Confirm',
      onClick: onConfirm,
      className: 'bg-green-600 hover:bg-green-700'
    },
    cancel: {
      icon: FiX,
      label: 'Cancel',
      onClick: onCancel,
      className: 'bg-red-600 hover:bg-red-700'
    },
    email: {
      icon: FiMail,
      label: 'Email',
      onClick: onEmailCustomer,
      className: 'bg-blue-600 hover:bg-blue-700'
    },
    export: {
      icon: FiDownload,
      label: 'Export',
      onClick: onExportPDF,
      className: 'bg-purple-600 hover:bg-purple-700'
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {availableActions.map((actionKey) => {
        const action = actionButtons[actionKey];
        if (!action) return null;

        const Icon = action.icon;
        
        return (
          <button
            key={actionKey}
            onClick={action.onClick}
            disabled={disabled}
            className={`${action.className} text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Icon className="w-4 h-4 mr-1" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
};

export default RentalOrderActions;
