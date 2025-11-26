export type AgentStatus = "idle" | "active" | "waiting" | "blocked" | "completed";

export interface Agent {
  status: AgentStatus;
  currentTask: string | null;
  completedTasks: string[];
  blockers: string[];
  lastUpdate: string | null;
  waitingFor?: string[];
}

export interface Project {
  name: string;
  status: "planning" | "in-progress" | "completed";
  currentPhase: string;
  description: string;
}

export type QualityGateStatus = "pending" | "approved" | "passed" | "failed";

export interface QualityGates {
  architecture: QualityGateStatus;
  database: QualityGateStatus;
  backend: QualityGateStatus;
  frontend: QualityGateStatus;
  qa: QualityGateStatus;
  deployment: QualityGateStatus;
}

export interface SharedContext {
  project: Project;
  agents: {
    architect: Agent;
    frontend: Agent;
    backend: Agent;
    database: Agent;
    devops: Agent;
    qa: Agent;
    documentation: Agent;
  };
  tasks: {
    active: string[];
    completed: string[];
    blocked: string[];
    backlog: string[];
  };
  agentTaskBoards?: {
    [agentId: string]: AgentTaskBoard;
  };
  qualityGates: QualityGates;
  infrastructure?: Infrastructure;
  taskExecutions?: TaskExecution[];
}

export type TaskExecutionStatus = 'pending' | 'executing' | 'completed' | 'failed';

export interface TaskExecution {
  id: string;
  agentId: string;
  agentName: string;
  prompt: string;
  tasks: TaskExecutionItem[];
  status: TaskExecutionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskExecutionItem {
  id: string;
  description: string;
  status: TaskExecutionStatus;
  order: number;
  assignee?: string;
  assignedTo?: string;
  reportTo?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  role: string;
}

export type InfrastructureStatus = "running" | "stopped" | "starting" | "stopping" | "error" | "unknown";

export interface Server {
  id: string;
  name: string;
  type: "api" | "frontend" | "backend" | "database" | "cache" | "queue" | "storage";
  status: InfrastructureStatus;
  url?: string;
  port?: number;
  cpu?: number;
  memory?: number;
  uptime?: number;
  lastCheck?: string;
}

export interface Database {
  id: string;
  name: string;
  type: "postgresql" | "mongodb" | "redis" | "mysql" | "vector-db";
  status: InfrastructureStatus;
  host?: string;
  port?: number;
  connections?: number;
  size?: string;
  lastBackup?: string;
}

export interface Infrastructure {
  servers: Server[];
  databases: Database[];
  lastUpdate: string;
}

