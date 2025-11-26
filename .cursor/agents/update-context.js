#!/usr/bin/env node
/**
 * Utility script to update shared context when agents execute workflows
 * This enables live visualization of agent activity
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHARED_CONTEXT_PATH = join(__dirname, 'shared-context.json');

/**
 * Update agent status in shared context
 */
export function updateAgentStatus(agentId, updates) {
  try {
    const context = JSON.parse(readFileSync(SHARED_CONTEXT_PATH, 'utf-8'));
    
    if (!context.agents[agentId]) {
      console.error(`Agent ${agentId} not found`);
      return false;
    }

    // Update agent status
    const agent = context.agents[agentId];
    
    if (updates.status) agent.status = updates.status;
    if (updates.currentTask !== undefined) agent.currentTask = updates.currentTask;
    if (updates.completedTasks) {
      if (Array.isArray(updates.completedTasks)) {
        agent.completedTasks = [...new Set([...agent.completedTasks, ...updates.completedTasks])];
      }
    }
    if (updates.blockers) {
      if (Array.isArray(updates.blockers)) {
        agent.blockers = updates.blockers;
      }
    }
    if (updates.waitingFor) {
      if (Array.isArray(updates.waitingFor)) {
        agent.waitingFor = updates.waitingFor;
      }
    }
    
    agent.lastUpdate = new Date().toISOString();

    // Update tasks if provided
    if (updates.taskUpdate) {
      const { action, task } = updates.taskUpdate;
      if (action === 'add-active' && !context.tasks.active.includes(task)) {
        context.tasks.active.push(task);
        // Remove from backlog if exists
        context.tasks.backlog = context.tasks.backlog.filter(t => t !== task);
      } else if (action === 'complete' && context.tasks.active.includes(task)) {
        context.tasks.active = context.tasks.active.filter(t => t !== task);
        if (!context.tasks.completed.includes(task)) {
          context.tasks.completed.push(task);
        }
      } else if (action === 'block' && context.tasks.active.includes(task)) {
        context.tasks.active = context.tasks.active.filter(t => t !== task);
        if (!context.tasks.blocked.includes(task)) {
          context.tasks.blocked.push(task);
        }
      }
    }

    // Write updated context
    writeFileSync(SHARED_CONTEXT_PATH, JSON.stringify(context, null, 2), 'utf-8');
    console.log(`✅ Updated ${agentId} status: ${updates.status || 'unchanged'}`);
    return true;
  } catch (error) {
    console.error('Error updating shared context:', error);
    return false;
  }
}

/**
 * CLI interface
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, agentId, action, ...args] = process.argv;
  
  if (!agentId || !action) {
    console.log('Usage: node update-context.js <agentId> <action> [args...]');
    console.log('Actions: start, complete, block, update');
    process.exit(1);
  }

  let updates = {};
  
  switch (action) {
    case 'start':
      updates = {
        status: 'active',
        currentTask: args[0] || null,
        taskUpdate: args[0] ? { action: 'add-active', task: args[0] } : null
      };
      break;
    case 'complete':
      updates = {
        status: 'completed',
        currentTask: null,
        completedTasks: args,
        taskUpdate: args[0] ? { action: 'complete', task: args[0] } : null
      };
      break;
    case 'block':
      updates = {
        status: 'blocked',
        blockers: args,
        taskUpdate: args[0] ? { action: 'block', task: args[0] } : null
      };
      break;
    case 'update':
      updates = {
        status: args[0] || 'active',
        currentTask: args[1] || null
      };
      break;
  }

  updateAgentStatus(agentId, updates);
}

