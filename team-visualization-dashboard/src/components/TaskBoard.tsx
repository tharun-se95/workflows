import { useState, useEffect } from 'react';
import { AgentTaskBoard, AgentTask } from '../types/types';
import { agentInfo } from '../utils/agentInfo';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface TaskBoardProps {
  tasks: {
    active: string[];
    completed: string[];
    blocked: string[];
    backlog: string[];
  };
}

export const TaskBoard = ({ tasks }: TaskBoardProps) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [agentTaskBoards, setAgentTaskBoards] = useState<Record<string, AgentTaskBoard>>({});
  const [loading, setLoading] = useState(false);
  const [reviewingTask, setReviewingTask] = useState<string | null>(null);

  // Fetch agent task boards
  useEffect(() => {
    const fetchTaskBoards = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/agent-task-boards?_t=${Date.now()}`);
        if (response.ok) {
          const boards = await response.json();
          setAgentTaskBoards(boards || {});
        } else if (response.status === 404) {
          // Endpoint not available yet, server may need restart
          console.warn('Agent task boards endpoint not available (server may need restart)');
          setAgentTaskBoards({});
        }
      } catch (error) {
        // Silently handle errors - endpoint may not be available
        console.error('Error fetching agent task boards:', error);
        setAgentTaskBoards({});
      }
    };

    fetchTaskBoards();
    const interval = setInterval(fetchTaskBoards, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle task review
  const handleReviewTask = async (taskId: string, action: 'approve' | 'reject') => {
    if (!selectedAgentId || selectedAgentId === 'all') return;
    
    setReviewingTask(taskId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/agent-task-boards/${selectedAgentId}/tasks/${taskId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewedBy: 'user' }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to ${action} task: ${error.error || 'Unknown error'}`);
        return;
      }

      // Refresh task boards
      const refreshResponse = await fetch(`${API_BASE_URL}/api/agent-task-boards?_t=${Date.now()}`);
      if (refreshResponse.ok) {
        const boards = await refreshResponse.json();
        setAgentTaskBoards(boards || {});
      }
    } catch (error) {
      console.error(`Error ${action}ing task:`, error);
      alert(`Failed to ${action} task`);
    } finally {
      setReviewingTask(null);
    }
  };

  // Handle approve all
  const handleApproveAll = async () => {
    if (!selectedAgentId || selectedAgentId === 'all') return;
    
    const taskBoard = agentTaskBoards[selectedAgentId];
    if (!taskBoard || taskBoard.pendingReview.length === 0) return;

    if (!confirm(`Approve all ${taskBoard.pendingReview.length} pending tasks?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/agent-task-boards/${selectedAgentId}/approve-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: 'user' }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to approve all tasks: ${error.error || 'Unknown error'}`);
        return;
      }

      // Refresh task boards
      const refreshResponse = await fetch(`${API_BASE_URL}/api/agent-task-boards?_t=${Date.now()}`);
      if (refreshResponse.ok) {
        const boards = await refreshResponse.json();
        setAgentTaskBoards(boards || {});
      }
    } catch (error) {
      console.error('Error approving all tasks:', error);
      alert('Failed to approve all tasks');
    } finally {
      setLoading(false);
    }
  };

  // Handle execute
  const handleExecute = async () => {
    if (!selectedAgentId || selectedAgentId === 'all') return;
    
    const taskBoard = agentTaskBoards[selectedAgentId];
    if (!taskBoard || taskBoard.approved.length === 0) {
      alert('No approved tasks to execute');
      return;
    }

    if (!confirm(`Execute ${taskBoard.approved.length} approved tasks?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/agent-task-boards/${selectedAgentId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to start execution: ${error.error || 'Unknown error'}`);
        return;
      }

      // Refresh task boards
      const refreshResponse = await fetch(`${API_BASE_URL}/api/agent-task-boards?_t=${Date.now()}`);
      if (refreshResponse.ok) {
        const boards = await refreshResponse.json();
        setAgentTaskBoards(boards || {});
      }
    } catch (error) {
      console.error('Error starting execution:', error);
      alert('Failed to start execution');
    } finally {
      setLoading(false);
    }
  };

  // Get current task board based on selected agent
  const currentTaskBoard = selectedAgentId !== 'all' ? agentTaskBoards[selectedAgentId] : null;

  // Calculate stats for traditional task board (when "all" is selected)
  const totalTasks = tasks.active.length + tasks.completed.length + tasks.blocked.length + tasks.backlog.length;
  const completedPercentage = totalTasks > 0 ? Math.round((tasks.completed.length / totalTasks) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 w-full h-full overflow-hidden flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Task Board</h2>
          
          {/* Agent Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="agent-select" className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              Agent:
            </label>
            <select
              id="agent-select"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Agents (Traditional View)</option>
              {agentInfo.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.emoji} {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons (only show for specific agent) */}
        {selectedAgentId !== 'all' && currentTaskBoard && (
          <div className="flex flex-wrap gap-2">
            {currentTaskBoard.pendingReview.length > 0 && (
              <button
                onClick={handleApproveAll}
                disabled={loading}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Approve All ({currentTaskBoard.pendingReview.length})
              </button>
            )}
            {currentTaskBoard.approved.length > 0 && (
              <button
                onClick={handleExecute}
                disabled={loading || currentTaskBoard.executing.length > 0}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ▶️ Execute ({currentTaskBoard.approved.length})
              </button>
            )}
          </div>
        )}

        {/* Progress for traditional view */}
        {selectedAgentId === 'all' && (
          <div className="text-xs sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{completedPercentage}%</span> Complete
          </div>
        )}
      </div>

      {/* Progress bar for traditional view */}
      {selectedAgentId === 'all' && (
        <div className="mb-3 sm:mb-4 h-2 bg-gray-200 rounded-full overflow-hidden flex-shrink-0" role="progressbar" aria-valuenow={completedPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div 
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${completedPercentage}%` }}
          ></div>
        </div>
      )}

      {/* Agent Task Board View */}
      {selectedAgentId !== 'all' && currentTaskBoard ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1 min-h-0 overflow-y-auto">
          {/* Pending Review */}
          <div className="min-h-[200px]">
            <h3 className="font-semibold text-yellow-600 mb-2 flex items-center gap-2">
              <span>🔍</span> Review ({currentTaskBoard.pendingReview.length})
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {currentTaskBoard.pendingReview.length > 0 ? (
                currentTaskBoard.pendingReview.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 bg-yellow-50 rounded border border-yellow-200 text-xs sm:text-sm"
                  >
                    <div className="mb-2 break-words">{task.description}</div>
                    {(task.assignee || task.assignedTo || task.reportTo) && (
                      <div className="mb-2 text-xs text-gray-600 space-y-0.5">
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
            <h3 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
              <span>✅</span> Approved ({currentTaskBoard.approved.length})
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {currentTaskBoard.approved.length > 0 ? (
                currentTaskBoard.approved.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 bg-blue-50 rounded border border-blue-200 text-xs sm:text-sm break-words"
                  >
                    <div className="mb-1">{task.description}</div>
                    {(task.assignee || task.assignedTo || task.reportTo) && (
                      <div className="text-xs text-gray-600 space-y-0.5">
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
            <h3 className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
              <span>⚙️</span> Executing ({currentTaskBoard.executing.length})
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {currentTaskBoard.executing.length > 0 ? (
                currentTaskBoard.executing.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 bg-purple-50 rounded border border-purple-200 text-xs sm:text-sm break-words"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                      {task.description}
                    </div>
                    {(task.assignee || task.assignedTo || task.reportTo) && (
                      <div className="text-xs text-gray-600 space-y-0.5 ml-5">
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
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No tasks executing</p>
              )}
            </div>
          </div>

          {/* Completed */}
          <div className="min-h-[200px]">
            <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
              <span>🎉</span> Completed ({currentTaskBoard.completed.length})
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {currentTaskBoard.completed.length > 0 ? (
                currentTaskBoard.completed.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 bg-green-50 rounded border border-green-200 text-xs sm:text-sm line-through opacity-75 break-words"
                  >
                    <div className="mb-1">✅ {task.description}</div>
                    {(task.assignee || task.assignedTo || task.reportTo) && (
                      <div className="text-xs text-gray-600 space-y-0.5">
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
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No completed tasks</p>
              )}
            </div>
          </div>
        </div>
      ) : selectedAgentId !== 'all' && !currentTaskBoard ? (
        // No task board for selected agent
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-sm mb-2">No tasks yet for this agent</p>
            <p className="text-xs">Click on the agent card to create tasks</p>
          </div>
        </div>
      ) : (
        // Traditional Task Board View (All Agents)
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1 min-h-0 overflow-y-auto">
        {/* Active Tasks */}
        <div>
          <h3 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
            <span>🟡</span> Active ({tasks.active.length})
          </h3>
          <div className="space-y-2">
            {tasks.active.length > 0 ? (
              tasks.active.map((task, idx) => (
                <div 
                  key={idx} 
                  className="p-2 bg-blue-50 rounded text-xs sm:text-sm text-gray-700 hover:bg-blue-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 break-words"
                  tabIndex={0}
                  role="button"
                  aria-label={`Active task: ${task}`}
                >
                  {task}
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-400 italic">No active tasks</p>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div>
          <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
            <span>✅</span> Completed ({tasks.completed.length})
          </h3>
          <div className="space-y-2">
            {tasks.completed.length > 0 ? (
              tasks.completed.map((task, idx) => (
                <div 
                  key={idx} 
                  className="p-2 bg-green-50 rounded text-xs sm:text-sm text-gray-700 line-through opacity-75 break-words"
                  aria-label={`Completed task: ${task}`}
                >
                  ✅ {task}
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-400 italic">No completed tasks</p>
            )}
          </div>
        </div>

        {/* Blocked Tasks */}
        <div>
          <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
            <span>🔴</span> Blocked ({tasks.blocked.length})
          </h3>
          <div className="space-y-2">
            {tasks.blocked.length > 0 ? (
              tasks.blocked.map((task, idx) => (
                <div 
                  key={idx} 
                  className="p-2 bg-red-50 rounded text-xs sm:text-sm text-gray-700 border-l-4 border-red-500 break-words"
                  aria-label={`Blocked task: ${task}`}
                >
                  ⚠️ {task}
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-400 italic">No blocked tasks</p>
            )}
          </div>
        </div>

        {/* Backlog */}
        <div className="flex flex-col min-h-0">
          <h3 className="font-semibold text-gray-600 mb-2 flex items-center gap-2 flex-shrink-0">
            <span>📋</span> Backlog ({tasks.backlog.length})
          </h3>
          <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
            {tasks.backlog.length > 0 ? (
              tasks.backlog.map((task, idx) => (
                <div 
                  key={idx} 
                  className="p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-700 break-words"
                  aria-label={`Backlog task: ${task}`}
                >
                  {task}
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-400 italic">No backlog items</p>
            )}
          </div>
        </div>
          </div>
        </>
      )}
    </div>
  );
};
