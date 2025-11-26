import { useState, useEffect } from 'react';
import { SharedContext } from '../types/types';
import { ProjectOverview } from './ProjectOverview';
import { AgentCard } from './AgentCard';
import { TaskBoard } from './TaskBoard';
import { QualityGatesComponent } from './QualityGates';
import { WorkflowGraph } from './WorkflowGraph';
import { InfrastructureStatus } from './InfrastructureStatus';
import { AgentPromptModal } from './AgentPromptModal';
import { TaskExecutionList, TaskExecution } from './TaskExecutionList';
import { ActivityTimeline } from './ActivityTimeline';
import { getAgentInfo, agentInfo } from '../utils/agentInfo';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface DashboardProps {
  context: SharedContext;
}

export const Dashboard = ({ context }: DashboardProps) => {
  const [selectedAgent, setSelectedAgent] = useState<typeof agentInfo[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskExecutions, setTaskExecutions] = useState<TaskExecution[]>([]);
  const [executionsLoading, setExecutionsLoading] = useState(true);
  const [executionsError, setExecutionsError] = useState<string | null>(null);

  const handleAgentClick = (agent: typeof agentInfo[0]) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const handlePromptSubmit = async (prompt: string, assignee?: string, assignedTo?: string, reportTo?: string) => {
    if (!selectedAgent) return;

    try {
      console.log('Triggering agent:', selectedAgent.id, 'with prompt:', prompt);
      const response = await fetch(`${API_BASE_URL}/api/agents/${selectedAgent.id}/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, assignee, assignedTo, reportTo }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to trigger agent: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Tasks created:', result);
      
      // Note: Tasks are created in "review" status
      // User must review and approve them before execution
      // Task boards will auto-refresh via polling in TaskBoard component
    } catch (error) {
      console.error('Error triggering agent:', error);
      throw error;
    }
  };

  // Fetch all executions from API
  const fetchAllExecutions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/executions?_t=${Date.now()}`);
      if (response.ok) {
        const executions = await response.json();
        setTaskExecutions(executions || []);
        setExecutionsError(null);
      } else {
        throw new Error(`Failed to fetch executions: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching executions:', error);
      setExecutionsError(error instanceof Error ? error.message : 'Failed to fetch executions');
    } finally {
      setExecutionsLoading(false);
    }
  };

  // Global polling for all executions (replaces individual polling)
  useEffect(() => {
    // Fetch immediately on mount
    fetchAllExecutions();

    // Set up global polling for ALL executions every 2 seconds
    const interval = setInterval(() => {
      fetchAllExecutions();
    }, 2000);

    return () => clearInterval(interval);
  }, []); // Only run on mount

  // Check server connectivity on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
          console.log('✅ Server is running and accessible');
        } else {
          console.warn('⚠️ Server health check failed:', response.status);
        }
      } catch (error) {
        console.error('❌ Cannot connect to server. Make sure it\'s running on', API_BASE_URL);
        console.error('Error:', error);
      }
    };
    checkServer();
  }, []);

  // Note: Executions are already loaded by the global polling useEffect above
  // No need for separate loadExecutions useEffect
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              🏗️ Engineering Team Dashboard
            </h1>
            <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
              Real-time updates every 2s
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-8">
        <ProjectOverview project={context.project} />

        {/* Workflow Graph */}
        <div className="w-full">
          <WorkflowGraph context={context} />
        </div>

        {/* Agent Status Grid */}
        <div className="w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Team Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
            {agentInfo.map((info) => {
              const agent = context.agents[info.id as keyof typeof context.agents];
              return (
                <AgentCard
                  key={info.id}
                  agent={agent}
                  agentInfo={info}
                  onClick={() => handleAgentClick(info)}
                />
              );
            })}
          </div>
        </div>

        {/* Infrastructure Status */}
        {context.infrastructure && (
          <div className="w-full">
            <InfrastructureStatus infrastructure={context.infrastructure} />
          </div>
        )}

        {/* Activity Timeline */}
        <div className="w-full">
          <ActivityTimeline autoRefresh={true} refreshInterval={2000} />
        </div>

        {/* Task Executions */}
        <div className="w-full">
          <TaskExecutionList executions={taskExecutions} />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <TaskBoard tasks={context.tasks} />
          <QualityGatesComponent gates={context.qualityGates} />
        </div>
      </main>

      {/* Agent Prompt Modal */}
      {selectedAgent && (
        <AgentPromptModal
          agent={selectedAgent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAgent(null);
          }}
          onSubmit={handlePromptSubmit}
        />
      )}
    </div>
  );
};
