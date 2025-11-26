import { useState, useEffect } from 'react';
import { AgentTaskBoard, AgentTask } from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AgentTaskBoardProps {
  agentId: string;
  agentName: string;
  taskBoard: AgentTaskBoard | null;
  onRefresh: () => void;
}

export const AgentTaskBoardComponent = ({ agentId, agentName, taskBoard, onRefresh }: AgentTaskBoardProps) => {
  const [loading, setLoading] = useState(false);
  const [reviewingTask, setReviewingTask] = useState<string | null>(null);

  const handleReviewTask = async (taskId: string, action: 'approve' | 'reject') => {
    setReviewingTask(taskId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/agent-task-boards/${agentId}/tasks/${taskId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewedBy: 'user' }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to ${action} task: ${error.error || 'Unknown error'}`);
        return;
      }

      onRefresh();
    } catch (error) {
      console.error(`Error ${action}ing task:`, error);
      alert(`Failed to ${action} task`);
    } finally {
      setReviewingTask(null);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm(`Approve all ${taskBoard?.pendingReview.length || 0} pending tasks?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/agent-task-boards/${agentId}/approve-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: 'user' }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to approve all tasks: ${error.error || 'Unknown error'}`);
        return;
      }

      onRefresh();
    } catch (error) {
      console.error('Error approving all tasks:', error);
      alert('Failed to approve all tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!taskBoard || taskBoard.approved.length === 0) {
      alert('No approved tasks to execute');
      return;
    }

    if (!confirm(`Execute ${taskBoard.approved.length} approved tasks?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/agent-task-boards/${agentId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to start execution: ${error.error || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      console.log('Execution started:', result);
      onRefresh();
    } catch (error) {
      console.error('Error starting execution:', error);
      alert('Failed to start execution');
    } finally {
      setLoading(false);
    }
  };

  if (!taskBoard) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{agentName}</h3>
        <p className="text-sm text-gray-500">No tasks yet. Create tasks by prompting this agent.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'executing': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{agentName}</h3>
        <div className="flex flex-wrap gap-2">
          {taskBoard.pendingReview.length > 0 && (
            <button
              onClick={handleApproveAll}
              disabled={loading}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve All ({taskBoard.pendingReview.length})
            </button>
          )}
          {taskBoard.approved.length > 0 && (
            <button
              onClick={handleExecute}
              disabled={loading || taskBoard.executing.length > 0}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶️ Execute ({taskBoard.approved.length})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pending Review */}
        <div className="min-h-[200px]">
          <h4 className="font-semibold text-yellow-600 mb-2 flex items-center gap-2">
            <span>🔍</span> Review ({taskBoard.pendingReview.length})
          </h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {taskBoard.pendingReview.length > 0 ? (
              taskBoard.pendingReview.map((task) => (
                <div
                  key={task.id}
                  className="p-2 bg-yellow-50 rounded border border-yellow-200 text-xs sm:text-sm"
                >
                  <div className="mb-2 break-words">{task.description}</div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleReviewTask(task.id, 'approve')}
                      disabled={reviewingTask === task.id}
                      className="flex-1 px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {reviewingTask === task.id ? '...' : '✓'}
                    </button>
                    <button
                      onClick={() => handleReviewTask(task.id, 'reject')}
                      disabled={reviewingTask === task.id}
                      className="flex-1 px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {reviewingTask === task.id ? '...' : '✗'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No tasks pending review</p>
            )}
          </div>
        </div>

        {/* Approved */}
        <div className="min-h-[200px]">
          <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
            <span>✅</span> Approved ({taskBoard.approved.length})
          </h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {taskBoard.approved.length > 0 ? (
              taskBoard.approved.map((task) => (
                <div
                  key={task.id}
                  className="p-2 bg-blue-50 rounded border border-blue-200 text-xs sm:text-sm break-words"
                >
                  {task.description}
                  {task.reviewedBy && (
                    <div className="text-xs text-gray-500 mt-1">Reviewed by {task.reviewedBy}</div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No approved tasks</p>
            )}
          </div>
        </div>

        {/* Executing */}
        <div className="min-h-[200px]">
          <h4 className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
            <span>⚙️</span> Executing ({taskBoard.executing.length})
          </h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {taskBoard.executing.length > 0 ? (
              taskBoard.executing.map((task) => (
                <div
                  key={task.id}
                  className="p-2 bg-purple-50 rounded border border-purple-200 text-xs sm:text-sm break-words"
                >
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                    {task.description}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No tasks executing</p>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="min-h-[200px]">
          <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
            <span>🎉</span> Completed ({taskBoard.completed.length})
          </h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {taskBoard.completed.length > 0 ? (
              taskBoard.completed.map((task) => (
                <div
                  key={task.id}
                  className="p-2 bg-green-50 rounded border border-green-200 text-xs sm:text-sm line-through opacity-75 break-words"
                >
                  ✅ {task.description}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No completed tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

