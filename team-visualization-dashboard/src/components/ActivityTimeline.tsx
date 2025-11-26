import { useState, useEffect } from 'react';
import { ActivityLog, ActivityFilters, ActivityAction } from '../types/activity';
import { agentInfo } from '../utils/agentInfo';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ActivityTimelineProps {
  initialActivities?: ActivityLog[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const ActivityTimeline = ({ 
  initialActivities = [], 
  autoRefresh = true,
  refreshInterval = 2000 
}: ActivityTimelineProps) => {
  const [activities, setActivities] = useState<ActivityLog[]>(initialActivities);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const loadActivities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedAgent !== 'all') params.append('agentId', selectedAgent);
      if (selectedAction !== 'all') params.append('action', selectedAction);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '100');

      const response = await fetch(`${API_BASE_URL}/api/activity-logs?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load activities');
      }
      
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [selectedAgent, selectedAction, searchQuery]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(loadActivities, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, selectedAgent, selectedAction, searchQuery]);

  const getActionIcon = (action: ActivityAction) => {
    switch (action) {
      case 'started':
        return '▶️';
      case 'completed':
        return '✅';
      case 'blocked':
        return '🚫';
      case 'assigned':
        return '📋';
      case 'updated':
        return '🔄';
      case 'failed':
        return '❌';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: ActivityAction) => {
    switch (action) {
      case 'started':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'blocked':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'assigned':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'updated':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const actionTypes: ActivityAction[] = ['started', 'completed', 'blocked', 'assigned', 'updated', 'failed'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Activity Timeline</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 sm:flex-none min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Agents</option>
            {agentInfo.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.emoji} {agent.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Actions</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {getActionIcon(action)} {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {loading && activities.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p className="font-medium">Error loading activities</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">No activities found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const agent = agentInfo.find(a => a.id === activity.agentId);
            const isLast = index === activities.length - 1;
            
            return (
              <div key={activity.id} className="relative flex gap-4">
                {/* Timeline Line */}
                {!isLast && (
                  <div className="absolute left-4 top-12 w-0.5 h-full bg-gray-200"></div>
                )}
                
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${getActionColor(activity.action)}`}>
                  {getActionIcon(activity.action)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg flex-shrink-0">{agent?.emoji || '👤'}</span>
                      <span className="font-semibold text-gray-900 truncate">{activity.agentName}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getActionColor(activity.action)}`}>
                        {activity.action}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  
                  {activity.task && (
                    <p className="text-sm text-gray-700 font-medium mb-1 break-words">
                      {activity.task}
                    </p>
                  )}
                  
                  {activity.details && (
                    <p className="text-sm text-gray-600 break-words">
                      {activity.details}
                    </p>
                  )}
                  
                  {activity.metadata?.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      Error: {activity.metadata.error}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Showing {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}
            {autoRefresh && ' • Auto-refreshing every 2s'}
          </p>
        </div>
      )}
    </div>
  );
};

