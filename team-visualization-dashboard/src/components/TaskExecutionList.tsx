import { useState } from 'react';
import { agentInfo } from '../utils/agentInfo';

export type TaskStatus = 'pending' | 'executing' | 'completed' | 'failed';

export interface TaskExecution {
  id: string;
  agentId: string;
  agentName: string;
  prompt: string;
  tasks: TaskItem[];
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  description: string;
  status: TaskStatus;
  order: number;
}

interface TaskExecutionListProps {
  executions: TaskExecution[];
  onTaskUpdate?: (executionId: string, taskId: string, status: TaskStatus) => void;
}

export const TaskExecutionList = ({ executions, onTaskUpdate }: TaskExecutionListProps) => {
  const [expandedExecutions, setExpandedExecutions] = useState<Set<string>>(new Set());

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all task executions? This action cannot be undone.')) {
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/executions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          errorMessage = error.error || error.details || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error('Failed to clear executions:', errorMessage);
        alert(`Failed to clear executions: ${errorMessage}`);
        return;
      }

      const result = await response.json();
      console.log('✅ Executions cleared successfully:', result);
      // Executions will be cleared and refreshed via polling
    } catch (error) {
      console.error('Error clearing executions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error - check if server is running';
      alert(`Failed to clear executions: ${errorMessage}`);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedExecutions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedExecutions(newExpanded);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'executing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'executing':
        return '⚙️';
      case 'failed':
        return '❌';
      case 'pending':
        return '⏳';
    }
  };

  if (executions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Task Executions</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">No active task executions</p>
          <p className="text-sm">Click on an agent card to assign a task</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Task Executions</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-gray-500">
            {executions.length} execution{executions.length !== 1 ? 's' : ''}
          </span>
          {executions.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              title="Clear all executions"
            >
              🗑️ Clear All
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {executions.map((execution) => {
          const isExpanded = expandedExecutions.has(execution.id);
          const completedTasks = execution.tasks.filter(t => t.status === 'completed').length;
          const totalTasks = execution.tasks.length;
          const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <div
              key={execution.id}
              className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
            >
              {/* Header */}
              <div
                className="p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggleExpanded(execution.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getStatusIcon(execution.status)}</span>
                      <span className="font-semibold text-gray-900">{execution.agentName}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 break-words">{execution.prompt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{completedTasks}/{totalTasks} tasks completed</span>
                      <span>{new Date(execution.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        execution.status === 'completed' ? 'bg-green-500' :
                        execution.status === 'executing' ? 'bg-blue-500' :
                        execution.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Task List:</h3>
                  <div className="space-y-2">
                    {execution.tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border-2 ${
                          task.status === 'completed' ? 'bg-green-50 border-green-200' :
                          task.status === 'executing' ? 'bg-blue-50 border-blue-200' :
                          task.status === 'failed' ? 'bg-red-50 border-red-200' :
                          'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2 flex-1">
                            <span className="text-sm font-medium text-gray-600 flex-shrink-0">
                              {index + 1}.
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 mb-1">{task.description}</p>
                              {(task.assignee || task.assignedTo || task.reportTo) && (
                                <div className="text-xs text-gray-600 space-y-0.5 mt-1">
                                  {task.assignee && (
                                    <div>👤 Assignee: {agentInfo.find(a => a.id === task.assignee)?.name || task.assignee}</div>
                                  )}
                                  {task.assignedTo && (
                                    <div>📋 Assigned by: {task.assignedTo === 'user' ? 'User' : agentInfo.find(a => a.id === task.assignedTo)?.name || task.assignedTo}</div>
                                  )}
                                  {task.reportTo && (
                                    <div>📊 Report to: {task.reportTo === 'user' ? 'User' : agentInfo.find(a => a.id === task.reportTo)?.name || task.reportTo}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium border flex-shrink-0 ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)} {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

