import { AgentInfo } from '../types/types';

export const agentInfo: AgentInfo[] = [
  {
    id: 'architect',
    name: 'Architect',
    emoji: '🏗️',
    role: 'System design and architecture decisions'
  },
  {
    id: 'frontend',
    name: 'Frontend Engineer',
    emoji: '🎨',
    role: 'UI/UX implementation'
  },
  {
    id: 'backend',
    name: 'Backend Engineer',
    emoji: '🔧',
    role: 'Server-side logic and APIs'
  },
  {
    id: 'database',
    name: 'Database Engineer',
    emoji: '💾',
    role: 'Database design and optimization'
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    emoji: '🚀',
    role: 'Infrastructure and deployment'
  },
  {
    id: 'qa',
    name: 'QA Engineer',
    emoji: '✅',
    role: 'Testing and quality assurance'
  },
  {
    id: 'documentation',
    name: 'Documentation Agent',
    emoji: '📚',
    role: 'Documentation and knowledge management'
  }
];

export const getAgentInfo = (id: string): AgentInfo | undefined => {
  return agentInfo.find(agent => agent.id === id);
};

