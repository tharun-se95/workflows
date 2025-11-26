export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'qa' | 'architect' | 'documentation' | 'general';
  agentType: string; // 'frontend', 'backend', etc.
  template: string; // Template with variables like {ComponentName}
  variables: string[]; // List of variable names like ['ComponentName', 'FeatureName']
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  agentType: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'frontend', name: 'Frontend', icon: '🎨', agentType: 'frontend' },
  { id: 'backend', name: 'Backend', icon: '🔧', agentType: 'backend' },
  { id: 'database', name: 'Database', icon: '💾', agentType: 'database' },
  { id: 'devops', name: 'DevOps', icon: '🚀', agentType: 'devops' },
  { id: 'qa', name: 'QA', icon: '✅', agentType: 'qa' },
  { id: 'architect', name: 'Architect', icon: '🏗️', agentType: 'architect' },
  { id: 'documentation', name: 'Documentation', icon: '📚', agentType: 'documentation' },
  { id: 'general', name: 'General', icon: '📝', agentType: 'general' },
];

