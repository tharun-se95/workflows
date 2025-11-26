import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, watchFile, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import { AgentExecutor } from './server/agent-executor.js';
import { 
  autoUpdateAgentStatus, 
  onTaskCompleted, 
  onExecutionStarted,
  checkAndUpdateAllAgents,
  startPeriodicCheck 
} from './server/context-automation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Path to shared context (relative to server.js location)
const SHARED_CONTEXT_PATH = join(__dirname, '..', '.cursor', 'agents', 'shared-context.json');
const EXECUTIONS_PATH = join(__dirname, '..', '.cursor', 'agents', 'task-executions.json');

// Cache for shared context
let cachedContext = null;
let lastModified = null;
// Don't cache taskExecutions - always read fresh from file

// Load task executions (always fresh, no caching)
const loadExecutions = () => {
  try {
    if (existsSync(EXECUTIONS_PATH)) {
      const data = readFileSync(EXECUTIONS_PATH, 'utf-8');
      const executions = JSON.parse(data);
      // Sort by createdAt (newest first)
      return executions.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }
    return [];
  } catch (error) {
    // File doesn't exist yet, initialize empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Error loading executions:', error);
    return [];
  }
};

const saveExecutions = (executions) => {
  try {
    // Always write fresh data (if executions provided, use it; otherwise load fresh)
    const dataToSave = executions || loadExecutions();
    writeFileSync(EXECUTIONS_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    console.log(`💾 Saved ${dataToSave.length} executions`);
  } catch (error) {
    console.error('Error saving executions:', error);
    console.error('Error details:', error.message, error.code);
  }
};

// Load initial executions
loadExecutions();

const loadSharedContext = () => {
  try {
    const data = readFileSync(SHARED_CONTEXT_PATH, 'utf-8');
    cachedContext = JSON.parse(data);
    lastModified = new Date().toISOString();
    return cachedContext;
  } catch (error) {
    console.error('Error reading shared context:', error);
    return null;
  }
};

const saveSharedContext = (context) => {
  try {
    writeFileSync(SHARED_CONTEXT_PATH, JSON.stringify(context, null, 2), 'utf-8');
    cachedContext = context;
    lastModified = new Date().toISOString();
    console.log('💾 Saved shared context');
  } catch (error) {
    console.error('Error saving shared context:', error);
    throw error;
  }
};

// Load initial data
loadSharedContext();

// Watch for file changes
watchFile(SHARED_CONTEXT_PATH, { interval: 1000 }, () => {
  console.log('Shared context file changed, reloading...');
  loadSharedContext();
});

// API endpoint to get shared context
app.get('/api/context', (req, res) => {
  const context = loadSharedContext();
  if (context) {
    // Simulate infrastructure updates (in real app, this would come from monitoring)
    if (context.infrastructure) {
      // Update last check times
      context.infrastructure.servers.forEach(server => {
        server.lastCheck = new Date().toISOString();
        // Simulate slight CPU/memory variations
        if (server.cpu !== undefined) {
          server.cpu = Math.max(10, Math.min(90, server.cpu + (Math.random() * 10 - 5)));
        }
        if (server.memory !== undefined) {
          server.memory = Math.max(20, Math.min(85, server.memory + (Math.random() * 5 - 2.5)));
        }
      });
      context.infrastructure.lastUpdate = new Date().toISOString();
    }
    res.json(context);
  } else {
    res.status(500).json({ error: 'Could not load shared context' });
  }
});

// API endpoint to trigger an agent (creates tasks but doesn't execute)
app.post('/api/agents/:agentId/trigger', async (req, res) => {
  const { agentId } = req.params;
  const { prompt, assignee, assignedTo, reportTo } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Generate task list from prompt using agent workflow
    const tasks = await generateTaskListFromPrompt(prompt, agentId);
    
    // Create tasks in agent's task board (pending review)
    const context = loadSharedContext();
    if (!context) {
      return res.status(500).json({ error: 'Could not load shared context' });
    }

    // Initialize agent task boards if not exists
    if (!context.agentTaskBoards) {
      context.agentTaskBoards = {};
    }

    if (!context.agentTaskBoards[agentId]) {
      context.agentTaskBoards[agentId] = {
        agentId,
        agentName: getAgentName(agentId),
        tasks: [],
        pendingReview: [],
        approved: [],
        executing: [],
        completed: [],
        lastUpdate: new Date().toISOString(),
      };
    }

    const taskBoard = context.agentTaskBoards[agentId];
    const taskId = randomUUID();
    const now = new Date().toISOString();

    // Create agent tasks with 'review' status
    const agentTasks = tasks.map((task, index) => ({
      id: `${taskId}-task-${index}`,
      description: task,
      status: 'review',
      priority: 'medium',
      assignee: assignee || agentId, // Task is assigned to the specified agent (defaults to prompted agent)
      assignedTo: assignedTo || 'user', // Assigned by the user or specified agent
      reportTo: reportTo || 'user', // Report updates to the user or specified agent
      createdAt: now,
      updatedAt: now,
      order: index + 1,
    }));

    // Add tasks to board
    taskBoard.tasks.push(...agentTasks);
    taskBoard.pendingReview.push(...agentTasks);
    taskBoard.lastUpdate = now;

    // Update shared context
    saveSharedContext(context);

    // Log activity
    logActivity({
      agentId: agentId,
      action: 'assigned',
      task: `Created ${tasks.length} tasks for review`,
      details: `Prompt: ${prompt}. Tasks created and pending review.`,
      metadata: { taskBoardId: agentId, taskCount: tasks.length }
    });

    res.json({
      success: true,
      agentId,
      agentName: getAgentName(agentId),
      tasks: agentTasks,
      message: `${tasks.length} tasks created and pending review`,
    });
  } catch (error) {
    console.error('Error triggering agent:', error);
    res.status(500).json({ error: 'Failed to trigger agent', details: error.message });
  }
});

// Generate task list from prompt by loading agent workflow
async function generateTaskListFromPrompt(prompt, agentId) {
  try {
    // Try to load actual workflow from agent file
    const executor = new AgentExecutor(agentId, prompt, 'temp');
    const workflow = await executor.loadWorkflow();
    
    // Extract all tasks from workflow steps
    const tasks = [];
    workflow.forEach(step => {
      step.tasks.forEach(task => {
        tasks.push(`${step.title}: ${task}`);
      });
    });

    if (tasks.length > 0) {
      return tasks;
    }
  } catch (error) {
    console.warn('Could not load workflow, using fallback:', error.message);
  }

  // Fallback: Simple task breakdown if workflow not found
  const lowerPrompt = prompt.toLowerCase();
  const tasks = [];

  if (lowerPrompt.includes('component') || lowerPrompt.includes('ui') || lowerPrompt.includes('interface')) {
    tasks.push('Design component structure');
    tasks.push('Create component file');
    tasks.push('Implement component logic');
    tasks.push('Add styling');
    tasks.push('Add responsive design');
    tasks.push('Test component');
  } else if (lowerPrompt.includes('api') || lowerPrompt.includes('endpoint') || lowerPrompt.includes('route')) {
    tasks.push('Design API endpoint');
    tasks.push('Create route handler');
    tasks.push('Implement business logic');
    tasks.push('Add validation');
    tasks.push('Add error handling');
    tasks.push('Test API endpoint');
  } else if (lowerPrompt.includes('database') || lowerPrompt.includes('schema') || lowerPrompt.includes('table')) {
    tasks.push('Design database schema');
    tasks.push('Create migration file');
    tasks.push('Define relationships');
    tasks.push('Add indexes');
    tasks.push('Test database structure');
  } else {
    // Generic task breakdown
    tasks.push('Analyze requirements');
    tasks.push('Plan implementation');
    tasks.push('Implement solution');
    tasks.push('Add error handling');
    tasks.push('Test implementation');
    tasks.push('Document changes');
  }

  return tasks;
}

function getAgentName(agentId) {
  const names = {
    architect: 'Architect',
    frontend: 'Frontend Engineer',
    backend: 'Backend Engineer',
    database: 'Database Engineer',
    devops: 'DevOps Engineer',
    qa: 'QA Engineer',
    documentation: 'Documentation',
  };
  return names[agentId] || agentId;
}

function updateAgentStatusInContext(agentId, updates) {
  try {
    const context = loadSharedContext();
    if (context && context.agents[agentId]) {
      const agent = context.agents[agentId];
      const oldStatus = agent.status;
      
      if (updates.status) agent.status = updates.status;
      if (updates.currentTask !== undefined) agent.currentTask = updates.currentTask;
      agent.lastUpdate = new Date().toISOString();
      
      writeFileSync(SHARED_CONTEXT_PATH, JSON.stringify(context, null, 2), 'utf-8');
      
      // Auto-log activity when status changes (logActivity defined below)
      if (updates.status && updates.status !== oldStatus) {
        const action = updates.status === 'active' ? 'started' : 
                      updates.status === 'completed' ? 'completed' :
                      updates.status === 'blocked' ? 'blocked' : 'updated';
        logActivity({
          agentId,
          action,
          task: updates.currentTask || agent.currentTask,
          details: `Status changed: ${oldStatus} → ${updates.status}`
        });
      }
    }
  } catch (error) {
    console.error('Error updating agent status:', error);
  }
}

// Helper function to log activities (defined before use)
function logActivity({ agentId, action, task, details, metadata }) {
  try {
    const logs = loadActivityLogs();
    const agentNames = {
      architect: 'Architect',
      frontend: 'Frontend Engineer',
      backend: 'Backend Engineer',
      database: 'Database Engineer',
      devops: 'DevOps Engineer',
      qa: 'QA Engineer',
      documentation: 'Documentation',
    };

    const newLog = {
      id: `activity-${Date.now()}-${agentId}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      agentId,
      agentName: agentNames[agentId] || agentId,
      action,
      task: task || null,
      details: details || null,
      metadata: metadata || null,
    };

    logs.push(newLog);
    
    // Keep only last 10000 entries
    if (logs.length > 10000) {
      logs.splice(0, logs.length - 10000);
    }
    
    saveActivityLogs(logs);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Real agent workflow execution
async function executeAgentWorkflow(executionId, agentId, prompt) {
  const executions = loadExecutions(); // Always get fresh data
  const execution = executions.find(e => e.id === executionId);
  if (!execution) {
    console.error(`Execution ${executionId} not found`);
    return;
  }

  console.log(`\n🎯 Starting REAL agent execution: ${executionId}`);
  console.log(`Agent: ${agentId}, Prompt: ${prompt}`);

  execution.status = 'executing';
  execution.updatedAt = new Date().toISOString();
  saveExecutions(executions);

  // Execute tasks directly from execution (simpler approach)
  // Instead of using AgentExecutor workflow, execute tasks sequentially
  const executeTasksSequentially = async () => {
    for (let i = 0; i < execution.tasks.length; i++) {
      const task = execution.tasks[i];
      
      // Update task to executing
      const executions = loadExecutions();
      const exec = executions.find(e => e.id === executionId);
      if (exec && exec.tasks[i]) {
        exec.tasks[i].status = 'executing';
        exec.updatedAt = new Date().toISOString();
        saveExecutions(executions);
        
        console.log(`📝 Task ${i + 1}/${exec.tasks.length}: ${task.description} → executing`);
        
        // Log activity
        logActivity({
          agentId: exec.agentId,
          action: 'started',
          task: task.description,
          details: `Task started: ${task.description}`,
          metadata: { executionId, taskId: task.id }
        });
      }
      
      // Simulate task execution (1.5-2 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 500));
      
      // Update task to completed
      const executions2 = loadExecutions();
      const exec2 = executions2.find(e => e.id === executionId);
      if (exec2 && exec2.tasks[i]) {
        exec2.tasks[i].status = 'completed';
        exec2.updatedAt = new Date().toISOString();
        saveExecutions(executions2);
        
        console.log(`✅ Task ${i + 1}/${exec2.tasks.length}: ${task.description} → completed`);
        
        // Update task board - mark task as completed
        const context = loadSharedContext();
        if (context && context.agentTaskBoards && context.agentTaskBoards[exec2.agentId]) {
          const taskBoard = context.agentTaskBoards[exec2.agentId];
          const boardTask = taskBoard.executing.find(t => t.id === task.id || t.executionId === executionId);
          if (boardTask) {
            boardTask.status = 'completed';
            boardTask.updatedAt = new Date().toISOString();
            taskBoard.executing = taskBoard.executing.filter(t => t.id !== boardTask.id);
            taskBoard.completed.push(boardTask);
            taskBoard.lastUpdate = new Date().toISOString();
            saveSharedContext(context);
          }
        }
        
        // Log activity
        logActivity({
          agentId: exec2.agentId,
          action: 'completed',
          task: task.description,
          details: `Task completed: ${task.description}`,
          metadata: { executionId, taskId: task.id }
        });
        
        // Auto-update agent status
        onTaskCompleted(executionId, exec2.agentId, task.description);
      }
    }
    
    // Mark execution as completed
    const executions3 = loadExecutions();
    const exec3 = executions3.find(e => e.id === executionId);
    if (exec3) {
      exec3.status = 'completed';
      exec3.updatedAt = new Date().toISOString();
      saveExecutions(executions3);
      
      console.log(`🎉 Execution ${executionId} completed!`);
      
      // Update task board - mark all executing tasks as completed
      const context = loadSharedContext();
      if (context && context.agentTaskBoards && context.agentTaskBoards[agentId]) {
        const taskBoard = context.agentTaskBoards[agentId];
        const executingTasks = taskBoard.executing.filter(t => t.executionId === executionId);
        executingTasks.forEach(task => {
          task.status = 'completed';
          task.updatedAt = new Date().toISOString();
        });
        taskBoard.executing = taskBoard.executing.filter(t => t.executionId !== executionId);
        taskBoard.completed.push(...executingTasks);
        taskBoard.lastUpdate = new Date().toISOString();
        saveSharedContext(context);
      }
      
      // Auto-update agent status
      autoUpdateAgentStatus(executionId, 'completed', agentId);
      
      // Log activity
      logActivity({
        agentId: agentId,
        action: 'completed',
        task: prompt,
        details: `Completed execution with ${exec3.tasks.length} tasks`,
        metadata: { executionId }
      });
    }
  };

  // Start executing tasks
  executeTasksSequentially().catch(error => {
    console.error(`❌ Execution ${executionId} error:`, error);
    
    // Mark execution as failed
    const executions = loadExecutions();
    const exec = executions.find(e => e.id === executionId);
    if (exec) {
      exec.status = 'failed';
      exec.updatedAt = new Date().toISOString();
      saveExecutions(executions);
      
      autoUpdateAgentStatus(executionId, 'failed', agentId);
      
      logActivity({
        agentId: agentId,
        action: 'failed',
        task: prompt,
        details: `Execution failed: ${error.message}`,
        metadata: { executionId, error: error.message }
      });
    }
  });
}

// API endpoint to get agent task board
app.get('/api/agent-task-boards/:agentId', (req, res) => {
  const { agentId } = req.params;

  try {
    const context = loadSharedContext();
    if (!context || !context.agentTaskBoards || !context.agentTaskBoards[agentId]) {
      return res.status(404).json({ error: 'Agent task board not found' });
    }

    res.json(context.agentTaskBoards[agentId]);
  } catch (error) {
    console.error('Error getting task board:', error);
    res.status(500).json({ error: 'Failed to get task board', details: error.message });
  }
});

// API endpoint to get all agent task boards
app.get('/api/agent-task-boards', (req, res) => {
  try {
    const context = loadSharedContext();
    if (!context || !context.agentTaskBoards) {
      return res.json({});
    }

    res.json(context.agentTaskBoards);
  } catch (error) {
    console.error('Error getting task boards:', error);
    res.status(500).json({ error: 'Failed to get task boards', details: error.message });
  }
});

// API endpoint to review and approve/reject tasks
app.post('/api/agent-task-boards/:agentId/tasks/:taskId/review', (req, res) => {
  const { agentId, taskId } = req.params;
  const { action, reviewedBy } = req.body; // action: 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Action must be approve or reject' });
  }

  try {
    const context = loadSharedContext();
    if (!context || !context.agentTaskBoards || !context.agentTaskBoards[agentId]) {
      return res.status(404).json({ error: 'Agent task board not found' });
    }

    const taskBoard = context.agentTaskBoards[agentId];
    const task = taskBoard.tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'review') {
      return res.status(400).json({ error: `Task is not in review status. Current status: ${task.status}` });
    }

    // Update task status
    const now = new Date().toISOString();
    task.updatedAt = now;
    task.reviewedAt = now;
    task.reviewedBy = reviewedBy || 'user';

    // Remove from pendingReview
    taskBoard.pendingReview = taskBoard.pendingReview.filter(t => t.id !== taskId);

    if (action === 'approve') {
      task.status = 'approved';
      taskBoard.approved.push(task);
    } else {
      task.status = 'rejected';
    }

    taskBoard.lastUpdate = now;
    saveSharedContext(context);

    // Log activity
    logActivity({
      agentId: agentId,
      action: action === 'approve' ? 'approved' : 'rejected',
      task: task.description,
      details: `Task ${action}d by ${task.reviewedBy}`,
      metadata: { taskId, agentId }
    });

    res.json({
      success: true,
      task,
      message: `Task ${action}d successfully`,
    });
  } catch (error) {
    console.error('Error reviewing task:', error);
    res.status(500).json({ error: 'Failed to review task', details: error.message });
  }
});

// API endpoint to approve all tasks for an agent
app.post('/api/agent-task-boards/:agentId/approve-all', (req, res) => {
  const { agentId } = req.params;
  const { reviewedBy } = req.body;

  try {
    const context = loadSharedContext();
    if (!context || !context.agentTaskBoards || !context.agentTaskBoards[agentId]) {
      return res.status(404).json({ error: 'Agent task board not found' });
    }

    const taskBoard = context.agentTaskBoards[agentId];
    const now = new Date().toISOString();
    let approvedCount = 0;

    // Approve all pending review tasks
    taskBoard.pendingReview.forEach(task => {
      task.status = 'approved';
      task.updatedAt = now;
      task.reviewedAt = now;
      task.reviewedBy = reviewedBy || 'user';
      taskBoard.approved.push(task);
      approvedCount++;
    });

    taskBoard.pendingReview = [];
    taskBoard.lastUpdate = now;
    saveSharedContext(context);

    // Log activity
    logActivity({
      agentId: agentId,
      action: 'approved',
      task: `Approved ${approvedCount} tasks`,
      details: `All pending tasks approved by ${reviewedBy || 'user'}`,
      metadata: { agentId, approvedCount }
    });

    res.json({
      success: true,
      approvedCount,
      message: `${approvedCount} tasks approved`,
    });
  } catch (error) {
    console.error('Error approving all tasks:', error);
    res.status(500).json({ error: 'Failed to approve tasks', details: error.message });
  }
});

// API endpoint to start execution from task board
app.post('/api/agent-task-boards/:agentId/execute', async (req, res) => {
  const { agentId } = req.params;
  const { taskIds } = req.body; // Optional: specific task IDs, or execute all approved

  try {
    const context = loadSharedContext();
    if (!context || !context.agentTaskBoards || !context.agentTaskBoards[agentId]) {
      return res.status(404).json({ error: 'Agent task board not found' });
    }

    const taskBoard = context.agentTaskBoards[agentId];
    
    // Get tasks to execute (either specified or all approved)
    let tasksToExecute = taskIds 
      ? taskBoard.approved.filter(t => taskIds.includes(t.id))
      : taskBoard.approved;

    if (tasksToExecute.length === 0) {
      return res.status(400).json({ error: 'No approved tasks to execute' });
    }

    // Create execution
    const executionId = randomUUID();
    const prompt = tasksToExecute.map(t => t.description).join('; ');
    
    const execution = {
      id: executionId,
      agentId,
      agentName: taskBoard.agentName,
      prompt,
      tasks: tasksToExecute.map((task, index) => ({
        id: task.id,
        description: task.description,
        status: 'pending',
        order: task.order,
      })),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save execution
    const executions = loadExecutions();
    executions.push(execution);
    saveExecutions(executions);

    // Update task statuses to executing
    const now = new Date().toISOString();
    tasksToExecute.forEach(task => {
      task.status = 'executing';
      task.updatedAt = now;
      task.executionId = executionId;
      
      // Move from approved to executing
      taskBoard.approved = taskBoard.approved.filter(t => t.id !== task.id);
      taskBoard.executing.push(task);
    });

    taskBoard.lastUpdate = now;
    saveSharedContext(context);

    // Update agent status
    updateAgentStatusInContext(agentId, {
      status: 'active',
      currentTask: tasksToExecute[0]?.description || prompt,
    });

    // Auto-update agent status
    onExecutionStarted(executionId, agentId, prompt);

    // Start execution
    executeAgentWorkflow(executionId, agentId, prompt);

    // Log activity
    logActivity({
      agentId: agentId,
      action: 'started',
      task: `Executing ${tasksToExecute.length} tasks`,
      details: `Execution started from task board`,
      metadata: { executionId, taskCount: tasksToExecute.length }
    });

    res.json({
      success: true,
      executionId,
      taskCount: tasksToExecute.length,
      message: `Execution started for ${tasksToExecute.length} tasks`,
    });
  } catch (error) {
    console.error('Error starting execution:', error);
    res.status(500).json({ error: 'Failed to start execution', details: error.message });
  }
});

// API endpoint to control server (start/stop/kill/restart)
app.post('/api/infrastructure/servers/:serverId/:action', (req, res) => {
  const { serverId, action } = req.params;
  const validActions = ['start', 'stop', 'kill', 'restart'];
  
  if (!validActions.includes(action)) {
    return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
  }

  try {
    const context = loadSharedContext();
    if (!context || !context.infrastructure) {
      return res.status(404).json({ error: 'Infrastructure not found' });
    }

    const server = context.infrastructure.servers.find(s => s.id === serverId);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    const oldStatus = server.status;
    let newStatus = server.status;

    // Handle actions
    switch (action) {
      case 'start':
        if (server.status === 'stopped' || server.status === 'error') {
          server.status = 'starting';
          newStatus = 'starting';
          // Simulate starting process (will be set to 'running' after delay)
          setTimeout(() => {
            const context2 = loadSharedContext();
            const server2 = context2?.infrastructure?.servers.find(s => s.id === serverId);
            if (server2 && server2.status === 'starting') {
              server2.status = 'running';
              server2.uptime = 0;
              server2.lastCheck = new Date().toISOString();
              saveSharedContext(context2);
            }
          }, 2000);
        } else {
          return res.status(400).json({ error: `Cannot start server. Current status: ${server.status}` });
        }
        break;

      case 'stop':
        if (server.status === 'running') {
          server.status = 'stopping';
          newStatus = 'stopping';
          // Simulate stopping process
          setTimeout(() => {
            const context2 = loadSharedContext();
            const server2 = context2?.infrastructure?.servers.find(s => s.id === serverId);
            if (server2 && server2.status === 'stopping') {
              server2.status = 'stopped';
              server2.cpu = 0;
              server2.memory = 0;
              server2.lastCheck = new Date().toISOString();
              saveSharedContext(context2);
            }
          }, 1500);
        } else {
          return res.status(400).json({ error: `Cannot stop server. Current status: ${server.status}` });
        }
        break;

      case 'kill':
        // Kill immediately (force stop)
        server.status = 'stopped';
        server.cpu = 0;
        server.memory = 0;
        server.lastCheck = new Date().toISOString();
        newStatus = 'stopped';
        break;

      case 'restart':
        if (server.status === 'running') {
          server.status = 'stopping';
          newStatus = 'stopping';
          // Simulate restart: stop then start
          setTimeout(() => {
            const context2 = loadSharedContext();
            const server2 = context2?.infrastructure?.servers.find(s => s.id === serverId);
            if (server2) {
              server2.status = 'starting';
              server2.cpu = 0;
              server2.memory = 0;
              saveSharedContext(context2);
              
              setTimeout(() => {
                const context3 = loadSharedContext();
                const server3 = context3?.infrastructure?.servers.find(s => s.id === serverId);
                if (server3 && server3.status === 'starting') {
                  server3.status = 'running';
                  server3.uptime = 0;
                  server3.lastCheck = new Date().toISOString();
                  saveSharedContext(context3);
                }
              }, 2000);
            }
          }, 1500);
        } else {
          return res.status(400).json({ error: `Cannot restart server. Current status: ${server.status}` });
        }
        break;
    }

    context.infrastructure.lastUpdate = new Date().toISOString();
    saveSharedContext(context);

    // Log activity
    logActivity({
      agentId: 'devops',
      action: 'updated',
      task: `Server ${action}: ${server.name}`,
      details: `Server ${server.name} status changed: ${oldStatus} → ${newStatus}`,
      metadata: { serverId, action, oldStatus, newStatus }
    });

    res.json({
      success: true,
      serverId,
      action,
      oldStatus,
      newStatus,
      message: `Server ${action} initiated`
    });
  } catch (error) {
    console.error('Error controlling server:', error);
    res.status(500).json({ error: 'Failed to control server', details: error.message });
  }
});

// API endpoint to control database (start/stop/kill/restart)
app.post('/api/infrastructure/databases/:databaseId/:action', (req, res) => {
  const { databaseId, action } = req.params;
  const validActions = ['start', 'stop', 'kill', 'restart'];
  
  if (!validActions.includes(action)) {
    return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
  }

  try {
    const context = loadSharedContext();
    if (!context || !context.infrastructure) {
      return res.status(404).json({ error: 'Infrastructure not found' });
    }

    const database = context.infrastructure.databases.find(d => d.id === databaseId);
    if (!database) {
      return res.status(404).json({ error: 'Database not found' });
    }

    const oldStatus = database.status;
    let newStatus = database.status;

    // Handle actions (similar to servers)
    switch (action) {
      case 'start':
        if (database.status === 'stopped' || database.status === 'error') {
          database.status = 'starting';
          newStatus = 'starting';
          setTimeout(() => {
            const context2 = loadSharedContext();
            const db2 = context2?.infrastructure?.databases.find(d => d.id === databaseId);
            if (db2 && db2.status === 'starting') {
              db2.status = 'running';
              db2.connections = 0;
              saveSharedContext(context2);
            }
          }, 2000);
        } else {
          return res.status(400).json({ error: `Cannot start database. Current status: ${database.status}` });
        }
        break;

      case 'stop':
        if (database.status === 'running') {
          database.status = 'stopping';
          newStatus = 'stopping';
          setTimeout(() => {
            const context2 = loadSharedContext();
            const db2 = context2?.infrastructure?.databases.find(d => d.id === databaseId);
            if (db2 && db2.status === 'stopping') {
              db2.status = 'stopped';
              db2.connections = 0;
              saveSharedContext(context2);
            }
          }, 1500);
        } else {
          return res.status(400).json({ error: `Cannot stop database. Current status: ${database.status}` });
        }
        break;

      case 'kill':
        database.status = 'stopped';
        database.connections = 0;
        newStatus = 'stopped';
        break;

      case 'restart':
        if (database.status === 'running') {
          database.status = 'stopping';
          newStatus = 'stopping';
          setTimeout(() => {
            const context2 = loadSharedContext();
            const db2 = context2?.infrastructure?.databases.find(d => d.id === databaseId);
            if (db2) {
              db2.status = 'starting';
              db2.connections = 0;
              saveSharedContext(context2);
              
              setTimeout(() => {
                const context3 = loadSharedContext();
                const db3 = context3?.infrastructure?.databases.find(d => d.id === databaseId);
                if (db3 && db3.status === 'starting') {
                  db3.status = 'running';
                  saveSharedContext(context3);
                }
              }, 2000);
            }
          }, 1500);
        } else {
          return res.status(400).json({ error: `Cannot restart database. Current status: ${database.status}` });
        }
        break;
    }

    context.infrastructure.lastUpdate = new Date().toISOString();
    saveSharedContext(context);

    // Log activity
    logActivity({
      agentId: 'devops',
      action: 'updated',
      task: `Database ${action}: ${database.name}`,
      details: `Database ${database.name} status changed: ${oldStatus} → ${newStatus}`,
      metadata: { databaseId, action, oldStatus, newStatus }
    });

    res.json({
      success: true,
      databaseId,
      action,
      oldStatus,
      newStatus,
      message: `Database ${action} initiated`
    });
  } catch (error) {
    console.error('Error controlling database:', error);
    res.status(500).json({ error: 'Failed to control database', details: error.message });
  }
});

// API endpoint to get all executions (always fresh)
app.get('/api/executions', (req, res) => {
  const executions = loadExecutions(); // Always get fresh data from file
  res.json(executions);
});

// API endpoint to clear all executions
app.delete('/api/executions', (req, res) => {
  try {
    saveExecutions([]);
    logActivity({
      agentId: 'system',
      action: 'cleared',
      task: 'All task executions cleared',
      details: 'All task executions have been cleared',
      metadata: {}
    });
    res.json({ success: true, message: 'All executions cleared' });
  } catch (error) {
    console.error('Error clearing executions:', error);
    res.status(500).json({ error: 'Failed to clear executions', details: error.message });
  }
});

// API endpoint to get specific execution (always fresh)
app.get('/api/executions/:executionId', (req, res) => {
  const executions = loadExecutions(); // Always get fresh data from file
  const execution = executions.find(e => e.id === req.params.executionId);
  if (!execution) {
    return res.status(404).json({ error: 'Execution not found' });
  }
  res.json(execution);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Prompt Templates endpoints
const TEMPLATES_PATH = join(__dirname, '..', '.cursor', 'agents', 'prompt-templates.json');

const loadTemplates = () => {
  try {
    if (existsSync(TEMPLATES_PATH)) {
      const data = readFileSync(TEMPLATES_PATH, 'utf-8');
      return JSON.parse(data);
    }
    // Return default templates if file doesn't exist
    return [];
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
};

const saveTemplates = (templates) => {
  try {
    writeFileSync(TEMPLATES_PATH, JSON.stringify(templates, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving templates:', error);
  }
};

// Initialize templates with defaults if file doesn't exist
if (!existsSync(TEMPLATES_PATH)) {
  // Import default templates
  const defaultTemplates = [
    {
      id: 'frontend-component',
      name: 'Create React Component',
      description: 'Create a new React component with TypeScript',
      category: 'frontend',
      agentType: 'frontend',
      template: 'Create a {ComponentName} component with the following features:\n- {Feature1}\n- {Feature2}\n- Responsive design\n- TypeScript types',
      variables: ['ComponentName', 'Feature1', 'Feature2'],
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'frontend-theme',
      name: 'Implement Dark Theme',
      description: 'Add dark mode support',
      category: 'frontend',
      agentType: 'frontend',
      template: 'Implement dark theme with:\n- Theme configuration\n- Color palette\n- Dark/light mode toggle\n- Theme persistence',
      variables: [],
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'backend-api',
      name: 'Create API Endpoint',
      description: 'Create a REST API endpoint',
      category: 'backend',
      agentType: 'backend',
      template: 'Create API endpoint for {Resource}:\n- Route: {Route}\n- Methods: {Methods}\n- Request validation\n- Error handling',
      variables: ['Resource', 'Route', 'Methods'],
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'database-schema',
      name: 'Design Database Schema',
      description: 'Create database schema design',
      category: 'database',
      agentType: 'database',
      template: 'Design database schema for {Feature}:\n- Tables: {Tables}\n- Relationships\n- Indexes',
      variables: ['Feature', 'Tables'],
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  saveTemplates(defaultTemplates);
}

// GET all templates
app.get('/api/prompt-templates', (req, res) => {
  const { category, agentType, search } = req.query;
  let templates = loadTemplates();

  // Filter by category
  if (category && category !== 'all') {
    templates = templates.filter(t => t.category === category);
  }

  // Filter by agent type
  if (agentType && agentType !== 'all') {
    templates = templates.filter(t => t.agentType === agentType);
  }

  // Search
  if (search) {
    const searchLower = search.toLowerCase();
    templates = templates.filter(t =>
      t.name.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower)
    );
  }

  res.json(templates);
});

// GET single template
app.get('/api/prompt-templates/:id', (req, res) => {
  const templates = loadTemplates();
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  res.json(template);
});

// POST create template
app.post('/api/prompt-templates', (req, res) => {
  const templates = loadTemplates();
  const newTemplate = {
    ...req.body,
    id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  templates.push(newTemplate);
  saveTemplates(templates);
  
  res.json(newTemplate);
});

// PUT update template
app.put('/api/prompt-templates/:id', (req, res) => {
  const templates = loadTemplates();
  const index = templates.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  templates[index] = {
    ...templates[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  
  saveTemplates(templates);
  res.json(templates[index]);
});

// POST increment usage count
app.post('/api/prompt-templates/:id/use', (req, res) => {
  const templates = loadTemplates();
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  template.usageCount = (template.usageCount || 0) + 1;
  template.updatedAt = new Date().toISOString();
  
  saveTemplates(templates);
  res.json(template);
});

// Activity Logs endpoints
const ACTIVITY_LOGS_PATH = join(__dirname, '..', '.cursor', 'agents', 'activity-logs.json');

const loadActivityLogs = () => {
  try {
    if (existsSync(ACTIVITY_LOGS_PATH)) {
      const data = readFileSync(ACTIVITY_LOGS_PATH, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading activity logs:', error);
    return [];
  }
};

const saveActivityLogs = (logs) => {
  try {
    writeFileSync(ACTIVITY_LOGS_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving activity logs:', error);
  }
};

// Initialize activity logs if file doesn't exist
if (!existsSync(ACTIVITY_LOGS_PATH)) {
  saveActivityLogs([]);
}

// GET activity logs with filtering
app.get('/api/activity-logs', (req, res) => {
  const { agentId, action, dateFrom, dateTo, search, limit = 100, offset = 0 } = req.query;
  let logs = loadActivityLogs();

  // Filter by agent
  if (agentId && agentId !== 'all') {
    logs = logs.filter(log => log.agentId === agentId);
  }

  // Filter by action
  if (action && action !== 'all') {
    logs = logs.filter(log => log.action === action);
  }

  // Filter by date range
  if (dateFrom) {
    logs = logs.filter(log => log.timestamp >= dateFrom);
  }
  if (dateTo) {
    logs = logs.filter(log => log.timestamp <= dateTo);
  }

  // Search
  if (search) {
    const searchLower = search.toLowerCase();
    logs = logs.filter(log =>
      (log.task && log.task.toLowerCase().includes(searchLower)) ||
      (log.details && log.details.toLowerCase().includes(searchLower)) ||
      log.agentName.toLowerCase().includes(searchLower)
    );
  }

  // Sort by timestamp (newest first)
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Pagination
  const total = logs.length;
  const paginatedLogs = logs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    activities: paginatedLogs,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
    hasMore: parseInt(offset) + parseInt(limit) < total
  });
});

// POST create activity log
app.post('/api/activity-logs', (req, res) => {
  const { agentId, action, task, details, metadata } = req.body;

  if (!agentId || !action) {
    return res.status(400).json({ error: 'agentId and action are required' });
  }

  const logs = loadActivityLogs();
  const agentNames = {
    architect: 'Architect',
    frontend: 'Frontend Engineer',
    backend: 'Backend Engineer',
    database: 'Database Engineer',
    devops: 'DevOps Engineer',
    qa: 'QA Engineer',
    documentation: 'Documentation',
  };

  const newLog = {
    id: `activity-${Date.now()}-${agentId}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    agentId,
    agentName: agentNames[agentId] || agentId,
    action,
    task: task || null,
    details: details || null,
    metadata: metadata || null,
  };

  logs.push(newLog);
  
  // Keep only last 10000 entries
  if (logs.length > 10000) {
    logs.splice(0, logs.length - 10000);
  }
  
  saveActivityLogs(logs);

  res.status(201).json({
    id: newLog.id,
    timestamp: newLog.timestamp,
    success: true
  });
});

// GET activity stats
app.get('/api/activity-logs/stats', (req, res) => {
  const { dateFrom, dateTo } = req.query;
  let logs = loadActivityLogs();

  // Filter by date range
  if (dateFrom) {
    logs = logs.filter(log => log.timestamp >= dateFrom);
  }
  if (dateTo) {
    logs = logs.filter(log => log.timestamp <= dateTo);
  }

  const stats = {
    totalActivities: logs.length,
    activitiesByAgent: {},
    activitiesByAction: {},
    timeRange: {
      from: dateFrom || (logs.length > 0 ? logs[logs.length - 1].timestamp : new Date().toISOString()),
      to: dateTo || (logs.length > 0 ? logs[0].timestamp : new Date().toISOString())
    }
  };

  // Count by agent
  logs.forEach(log => {
    stats.activitiesByAgent[log.agentId] = (stats.activitiesByAgent[log.agentId] || 0) + 1;
  });

  // Count by action
  logs.forEach(log => {
    stats.activitiesByAction[log.action] = (stats.activitiesByAction[log.action] || 0) + 1;
  });

  res.json(stats);
});

// GET export activity logs
app.get('/api/activity-logs/export', (req, res) => {
  const { format = 'json' } = req.query;
  const logs = loadActivityLogs();

  if (format === 'csv') {
    const csv = [
      'Timestamp,Agent,Action,Task,Details',
      ...logs.map(log => 
        `"${log.timestamp}","${log.agentName}","${log.action}","${log.task || ''}","${log.details || ''}"`
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(logs);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Serving shared context from: ${SHARED_CONTEXT_PATH}`);
  console.log(`📋 Task executions stored in: ${EXECUTIONS_PATH}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  
  // Start automated context update system
  // Check for stuck executions and auto-update agent statuses every minute
  startPeriodicCheck(60000); // Check every 60 seconds
  
  // Initial check on startup
  checkAndUpdateAllAgents();
  console.log(`🤖 Automated context update system started`);
});

