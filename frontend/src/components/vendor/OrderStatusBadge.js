import React from 'react';
import { FiClock, FiCheck, FiPlay, FiCheckCircle, FiX } from 'react-icons/fi';

const OrderStatusBadge = ({ status, onChange, editable = false }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: FiClock,
        label: 'Pending'
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: FiCheck,
        label: 'Confirmed'
      },
      'in-progress': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: FiPlay,
        label: 'In Progress'
      },
      completed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: FiCheckCircle,
        label: 'Completed'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: FiX,
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  if (editable) {
    return (
      <select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        className={`text-xs px-2 py-1 rounded-full border ${config.color} focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
