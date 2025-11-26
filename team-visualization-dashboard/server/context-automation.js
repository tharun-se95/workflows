/**
 * Automated Context Update System
 * 
 * Automatically updates agent status in shared-context.json based on:
 * - Task completion
 * - Workflow execution status
 * - Time-based completion detection
 */

import { readFileSync, writeFileSync } from 'fs';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHARED_CONTEXT_PATH = join(__dirname, '..', '..', '.cursor', 'agents', 'shared-context.json');
const EXECUTIONS_PATH = join(__dirname, '..', '..', '.cursor', 'agents', 'task-executions.json');

/**
 * Load shared context
 */
function loadSharedContext() {
  try {
    if (existsSync(SHARED_CONTEXT_PATH)) {
      const data = readFileSync(SHARED_CONTEXT_PATH, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading shared context:', error);
    return null;
  }
}

/**
 * Save shared context
 */
function saveSharedContext(context) {
  try {
    writeFileSync(SHARED_CONTEXT_PATH, JSON.stringify(context, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving shared context:', error);
    return false;
  }
}

/**
 * Load task executions
 */
function loadExecutions() {
  try {
    if (existsSync(EXECUTIONS_PATH)) {
      const data = readFileSync(EXECUTIONS_PATH, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading executions:', error);
    return [];
  }
}

/**
 * Check if all tasks for an agent execution are completed
 */
function areAllTasksCompleted(execution) {
  if (!execution || !execution.tasks || execution.tasks.length === 0) {
    return false;
  }
  
  return execution.tasks.every(task => 
    task.status === 'completed' || task.status === 'failed'
  );
}

/**
 * Check if execution has been running for too long (stuck detection)
 */
function isExecutionStuck(execution, maxDurationMinutes = 30) {
  if (!execution.createdAt) return false;
  
  const createdAt = new Date(execution.createdAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  
  // If execution is still active but all tasks are done, it's stuck
  if (execution.status === 'executing' && areAllTasksCompleted(execution)) {
    return true;
  }
  
  // If execution has been running for too long
  if (execution.status === 'executing' && diffMinutes > maxDurationMinutes) {
    return true;
  }
  
  return false;
}

/**
 * Automatically update agent status based on execution state
 */
export function autoUpdateAgentStatus(executionId, executionStatus, agentId) {
  const context = loadSharedContext();
  if (!context || !context.agents[agentId]) {
    return false;
  }

  const agent = context.agents[agentId];
  const oldStatus = agent.status;

  // If execution completed successfully, mark agent as completed
  if (executionStatus === 'completed') {
    if (agent.status === 'active') {
      agent.status = 'completed';
      agent.currentTask = null;
      agent.lastUpdate = new Date().toISOString();
      
      // Move current task to completed tasks
      if (agent.currentTask) {
        if (!agent.completedTasks.includes(agent.currentTask)) {
          agent.completedTasks.push(agent.currentTask);
        }
      }
      
      saveSharedContext(context);
      
      // Log the status change
      console.log(`✅ Auto-updated ${agentId} status: ${oldStatus} → completed`);
      return true;
    }
  }

  // If execution failed, mark agent as idle (not blocked, just idle)
  if (executionStatus === 'failed') {
    if (agent.status === 'active') {
      agent.status = 'idle';
      agent.currentTask = null;
      agent.lastUpdate = new Date().toISOString();
      
      saveSharedContext(context);
      
      console.log(`⚠️ Auto-updated ${agentId} status: ${oldStatus} → idle (execution failed)`);
      return true;
    }
  }

  return false;
}

/**
 * Check and auto-update all agent statuses based on executions
 */
export function checkAndUpdateAllAgents() {
  const executions = loadExecutions();
  const context = loadSharedContext();
  
  if (!context) return;

  // Group executions by agent
  const agentExecutions = {};
  
  executions.forEach(exec => {
    if (!agentExecutions[exec.agentId]) {
      agentExecutions[exec.agentId] = [];
    }
    agentExecutions[exec.agentId].push(exec);
  });

  // Check each agent's executions
  Object.keys(agentExecutions).forEach(agentId => {
    const agentExecs = agentExecutions[agentId];
    const agent = context.agents[agentId];
    
    if (!agent) return;

    // Find the most recent execution
    const recentExec = agentExecs
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (!recentExec) return;

    // If agent is active but execution is completed, auto-update
    if (agent.status === 'active' && recentExec.status === 'completed') {
      if (areAllTasksCompleted(recentExec)) {
        autoUpdateAgentStatus(recentExec.id, 'completed', agentId);
      }
    }

    // If execution is stuck, mark as completed or failed
    if (isExecutionStuck(recentExec)) {
      if (areAllTasksCompleted(recentExec)) {
        // All tasks done but status not updated - mark as completed
        autoUpdateAgentStatus(recentExec.id, 'completed', agentId);
      } else {
        // Stuck with incomplete tasks - mark as failed
        autoUpdateAgentStatus(recentExec.id, 'failed', agentId);
      }
    }
  });
}

/**
 * Update agent status when task completes
 */
export function onTaskCompleted(executionId, agentId, taskDescription) {
  const executions = loadExecutions();
  const execution = executions.find(e => e.id === executionId);
  
  if (!execution) return;

  // Check if all tasks are now completed
  if (areAllTasksCompleted(execution)) {
    // Auto-update execution status
    execution.status = 'completed';
    execution.updatedAt = new Date().toISOString();
    
    // Save executions
    try {
      writeFileSync(EXECUTIONS_PATH, JSON.stringify(executions, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving executions:', error);
    }

    // Auto-update agent status
    autoUpdateAgentStatus(executionId, 'completed', agentId);
  }
}

/**
 * Update agent status when execution starts
 */
export function onExecutionStarted(executionId, agentId, prompt) {
  const context = loadSharedContext();
  if (!context || !context.agents[agentId]) {
    return;
  }

  const agent = context.agents[agentId];
  
  // Only update if agent is not already active
  if (agent.status !== 'active') {
    agent.status = 'active';
    agent.currentTask = prompt || 'Executing workflow';
    agent.lastUpdate = new Date().toISOString();
    
    saveSharedContext(context);
    
    console.log(`🔄 Auto-updated ${agentId} status: ${agent.status} → active`);
  }
}

/**
 * Periodic check for stuck executions (call this periodically)
 */
export function startPeriodicCheck(intervalMs = 60000) {
  setInterval(() => {
    checkAndUpdateAllAgents();
  }, intervalMs);
  
  console.log(`🔄 Started periodic agent status check (every ${intervalMs / 1000}s)`);
}

