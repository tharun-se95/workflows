export type ActivityAction = 
  | 'started'      // Agent started a task
  | 'completed'    // Agent completed a task
  | 'blocked'       // Agent encountered a blocker
  | 'assigned'      // Task was assigned to agent
  | 'updated'       // Agent updated status
  | 'failed';       // Task failed

export interface ActivityLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  action: ActivityAction;
  task?: string;
  details?: string;
  metadata?: {
    executionId?: string;
    taskId?: string;
    duration?: number;
    error?: string;
  };
}

export interface ActivityFilters {
  agentId?: string;
  action?: ActivityAction;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ActivityStats {
  totalActivities: number;
  activitiesByAgent: Record<string, number>;
  activitiesByAction: Record<ActivityAction, number>;
  timeRange: {
    from: string;
    to: string;
  };
}

