import { AgentStatus } from '../types/types';

export const getStatusColor = (status: AgentStatus): string => {
  switch (status) {
    case 'active':
      return '#10b981'; // green-500
    case 'waiting':
      return '#f59e0b'; // yellow-500
    case 'blocked':
      return '#ef4444'; // red-500
    case 'completed':
      return '#6b7280'; // gray-500
    case 'idle':
    default:
      return '#9ca3af'; // gray-400
  }
};

export const getStatusBgColor = (status: AgentStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'waiting':
      return 'bg-yellow-500';
    case 'blocked':
      return 'bg-red-500';
    case 'completed':
      return 'bg-gray-500';
    case 'idle':
    default:
      return 'bg-gray-400';
  }
};

export const getStatusTextColor = (status: AgentStatus): string => {
  switch (status) {
    case 'active':
      return 'text-green-700';
    case 'waiting':
      return 'text-yellow-700';
    case 'blocked':
      return 'text-red-700';
    case 'completed':
      return 'text-gray-700';
    case 'idle':
    default:
      return 'text-gray-600';
  }
};

export const getStatusBadgeColor = (status: AgentStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'waiting':
      return 'bg-yellow-100 text-yellow-800';
    case 'blocked':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'idle':
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

