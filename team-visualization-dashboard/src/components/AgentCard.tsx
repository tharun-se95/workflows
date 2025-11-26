import { Agent } from '../types/types';
import { AgentInfo } from '../types/types';
import { getStatusBadgeColor } from '../utils/statusColors';

interface AgentCardProps {
  agent: Agent;
  agentInfo: AgentInfo;
  onClick?: () => void;
}

export const AgentCard = ({ agent, agentInfo, onClick }: AgentCardProps) => {
  const statusColor = getStatusBadgeColor(agent.status);
  const statusLabel = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);

  return (
    <div 
      className={`bg-white rounded-lg shadow p-3 sm:p-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 w-full h-full flex flex-col overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : "article"}
      aria-label={`${agentInfo.name} - Status: ${statusLabel}`}
      onClick={onClick}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xl sm:text-2xl flex-shrink-0" aria-hidden="true">{agentInfo.emoji}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{agentInfo.name}</h3>
            <p className="text-xs text-gray-500 line-clamp-1">{agentInfo.role}</p>
          </div>
        </div>
        <span 
          className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${statusColor}`}
          aria-label={`Status: ${statusLabel}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {agent.currentTask && (
          <div className="mb-2 p-2 bg-blue-50 rounded">
            <p className="text-xs text-blue-600 font-medium mb-1">Current Task:</p>
            <p className="text-xs sm:text-sm text-gray-700 break-words">{agent.currentTask}</p>
          </div>
        )}

        {agent.blockers.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 rounded" role="alert">
            <p className="text-xs text-red-600 font-medium mb-1">Blockers:</p>
            <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
              {agent.blockers.map((blocker, idx) => (
                <li key={idx} className="break-words">{blocker}</li>
              ))}
            </ul>
          </div>
        )}

        {agent.waitingFor && agent.waitingFor.length > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 rounded">
            <p className="text-xs text-yellow-600 font-medium mb-1">Waiting for:</p>
            <p className="text-xs text-yellow-700 break-words">{agent.waitingFor.join(', ')}</p>
          </div>
        )}

        {agent.completedTasks.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              ✅ Completed: {agent.completedTasks.length} task(s)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
