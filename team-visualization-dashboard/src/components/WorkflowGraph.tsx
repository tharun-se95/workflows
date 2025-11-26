import { useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SharedContext } from '../types/types';
import { getStatusColor } from '../utils/statusColors';
import { agentInfo } from '../utils/agentInfo';

interface WorkflowGraphProps {
  context: SharedContext;
}

// Define workflow dependencies
const workflowDependencies: Record<string, string[]> = {
  architect: [],
  database: ['architect'],
  backend: ['database'],
  frontend: ['backend'],
  qa: ['frontend', 'backend'],
  devops: ['frontend', 'backend', 'qa'],
  documentation: [],
};

export const WorkflowGraph = ({ context }: WorkflowGraphProps) => {
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Track space key press for zoom control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const { nodes, edges } = useMemo(() => {
    const agentNodes: Node[] = [];
    const workflowEdges: Edge[] = [];

    // Create nodes for each agent
    agentInfo.forEach((info, index) => {
      const agent = context.agents[info.id as keyof typeof context.agents];
      const statusColor = getStatusColor(agent.status);
      const statusLabel = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);

      // Position nodes in a workflow layout (responsive spacing)
      const row = Math.floor(index / 3);
      const col = index % 3;
      const spacingX = 200; // Reduced spacing for better mobile
      const spacingY = 150;
      const x = col * spacingX + 50;
      const y = row * spacingY + 50;

      agentNodes.push({
        id: info.id,
        type: 'default',
        position: { x, y },
        data: {
          label: (
            <div className="text-center min-w-0">
              <div className="text-xl sm:text-2xl mb-1" aria-hidden="true">{info.emoji}</div>
              <div className="font-semibold text-xs sm:text-sm truncate">{info.name}</div>
              <div className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded mt-1 inline-block text-white whitespace-nowrap`} style={{ backgroundColor: statusColor }}>
                {statusLabel}
              </div>
            </div>
          ),
        },
        style: {
          background: '#fff',
          border: `2px solid ${agent.status === 'active' ? '#10b981' : agent.status === 'blocked' ? '#ef4444' : '#e5e7eb'}`,
          borderRadius: '8px',
          padding: '8px',
          minWidth: '120px',
          maxWidth: '180px',
          boxShadow: agent.status === 'active' ? '0 4px 6px rgba(16, 185, 129, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        },
      });
    });

    // Create edges based on dependencies
    Object.entries(workflowDependencies).forEach(([agentId, deps]) => {
      deps.forEach((depId) => {
        workflowEdges.push({
          id: `e${depId}-${agentId}`,
          source: depId,
          target: agentId,
          type: 'smoothstep',
          animated: context.agents[agentId as keyof typeof context.agents].status === 'active',
          style: {
            stroke: context.agents[agentId as keyof typeof context.agents].status === 'active' ? '#10b981' : '#94a3b8',
            strokeWidth: 2,
          },
          label: '',
          ariaLabel: `Dependency from ${depId} to ${agentId}`,
        });
      });
    });

    return { nodes: agentNodes, edges: workflowEdges };
  }, [context]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 w-full overflow-hidden">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 px-1">Workflow Visualization</h2>
      <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] border border-gray-200 rounded-lg overflow-hidden" role="img" aria-label="Workflow graph showing agent dependencies">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-left"
          aria-label="Interactive workflow graph"
          className="w-full h-full"
          zoomOnScroll={isSpacePressed}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={!isSpacePressed}
        >
          <Background color="#f1f5f9" gap={16} />
          <Controls className="bg-white rounded shadow-sm border border-gray-200" />
          <MiniMap
            nodeColor={(node) => {
              const agent = context.agents[node.id as keyof typeof context.agents];
              if (agent.status === 'active') return '#10b981';
              if (agent.status === 'blocked') return '#ef4444';
              if (agent.status === 'waiting') return '#f59e0b';
              return '#94a3b8';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            className="bg-white border border-gray-200 rounded shadow-sm"
          />
        </ReactFlow>
      </div>
      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-600 px-1" role="list" aria-label="Status legend">
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true"></div>
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-3 h-3 rounded-full bg-yellow-500" aria-hidden="true"></div>
          <span>Waiting</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-3 h-3 rounded-full bg-red-500" aria-hidden="true"></div>
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-3 h-3 rounded-full bg-gray-400" aria-hidden="true"></div>
          <span>Idle/Completed</span>
        </div>
      </div>
    </div>
  );
};
