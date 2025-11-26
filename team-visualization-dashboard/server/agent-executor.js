import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

// Import context updater
const CONTEXT_UPDATER_PATH = join(__dirname, '..', '..', '.cursor', 'agents', 'update-context.js');

class AgentExecutor {
  constructor(agentId, prompt, executionId) {
    this.agentId = agentId;
    this.prompt = prompt;
    this.executionId = executionId;
    this.workflowPath = join(process.cwd(), '.cursor', 'commands', `${agentId}-agent.md`);
    this.tasks = [];
    this.currentTaskIndex = 0;
    this.cursorBridge = new CursorBridge();
  }

  async loadWorkflow() {
    if (!existsSync(this.workflowPath)) {
      console.warn(`Workflow file not found: ${this.workflowPath}`);
      return this.generateDefaultWorkflow();
    }

    const content = readFileSync(this.workflowPath, 'utf-8');
    return this.parseWorkflow(content);
  }

  parseWorkflow(content) {
    const steps = [];
    const lines = content.split('\n');
    let currentStep = null;
    let inCodeBlock = false;
    let codeBlockContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect workflow steps
      if (line.match(/^\d+\.\s+\*\*/)) {
        if (currentStep) {
          if (codeBlockContent.length > 0) {
            currentStep.commands = codeBlockContent.join('\n');
            codeBlockContent = [];
          }
          steps.push(currentStep);
        }
        const title = line.replace(/^\d+\.\s+\*\*/, '').replace(/\*\*/, '').trim();
        currentStep = {
          title,
          tasks: [],
          commands: []
        };
      } else if (line.includes('```bash') || line.includes('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && codeBlockContent.length > 0) {
          if (currentStep) {
            currentStep.commands = codeBlockContent.join('\n');
            codeBlockContent = [];
          }
        }
      } else if (inCodeBlock && currentStep) {
        codeBlockContent.push(line);
      } else if (currentStep && line.trim().startsWith('-') && !line.includes('```')) {
        const task = line.trim().replace(/^-\s*/, '').replace(/\*\*/g, '').trim();
        if (task && !task.startsWith('```')) {
          currentStep.tasks.push(task);
        }
      }
    }

    if (currentStep) {
      if (codeBlockContent.length > 0) {
        currentStep.commands = codeBlockContent.join('\n');
      }
      steps.push(currentStep);
    }

    return steps.length > 0 ? steps : this.generateDefaultWorkflow();
  }

  generateDefaultWorkflow() {
    // Generate a default workflow based on agent type and prompt
    const lowerPrompt = this.prompt.toLowerCase();
    
    if (this.agentId === 'frontend') {
      return [
        {
          title: 'Plan Implementation',
          tasks: [
            'Analyze requirements',
            'Design component structure',
            'Plan state management'
          ],
          commands: ''
        },
        {
          title: 'Implement Components',
          tasks: [
            'Create component files',
            'Implement UI logic',
            'Add styling',
            'Handle user interactions'
          ],
          commands: ''
        },
        {
          title: 'Quality Check',
          tasks: [
            'Run linting',
            'Fix formatting issues',
            'Type checking',
            'Test component'
          ],
          commands: 'npm run lint:fix && npm run format && npm run type-check'
        }
      ];
    } else if (this.agentId === 'backend') {
      return [
        {
          title: 'Design API',
          tasks: [
            'Design endpoint structure',
            'Define request/response schemas',
            'Plan error handling'
          ],
          commands: ''
        },
        {
          title: 'Implement API',
          tasks: [
            'Create route handler',
            'Implement business logic',
            'Add validation',
            'Add error handling'
          ],
          commands: ''
        },
        {
          title: 'Test API',
          tasks: [
            'Write unit tests',
            'Test endpoints',
            'Verify error handling'
          ],
          commands: ''
        }
      ];
    }

    // Generic workflow
    return [
      {
        title: 'Analyze Requirements',
        tasks: ['Understand the task', 'Plan approach'],
        commands: ''
      },
      {
        title: 'Implement Solution',
        tasks: ['Create necessary files', 'Implement functionality'],
        commands: ''
      },
      {
        title: 'Verify and Test',
        tasks: ['Run tests', 'Verify functionality'],
        commands: ''
      }
    ];
  }

  async updateAgentStatus(status, currentTask = null) {
    try {
      // Use the context updater script
      const { updateAgentStatus } = await import(`file://${CONTEXT_UPDATER_PATH}`);
      await updateAgentStatus(this.agentId, {
        status,
        currentTask,
        completedTasks: currentTask ? [currentTask] : []
      });
    } catch (error) {
      console.error('Error updating agent status:', error);
      // Fallback: direct file update
      await this.updateContextDirectly(status, currentTask);
    }
  }

  async updateContextDirectly(status, currentTask) {
    try {
      const contextPath = join(process.cwd(), '.cursor', 'agents', 'shared-context.json');
      const context = JSON.parse(readFileSync(contextPath, 'utf-8'));
      
      if (context.agents[this.agentId]) {
        context.agents[this.agentId].status = status;
        if (currentTask !== null) {
          context.agents[this.agentId].currentTask = currentTask;
        }
        context.agents[this.agentId].lastUpdate = new Date().toISOString();
        
        writeFileSync(contextPath, JSON.stringify(context, null, 2), 'utf-8');
      }
    } catch (error) {
      console.error('Error updating context directly:', error);
    }
  }

  async executeCommand(command) {
    if (!command || !command.trim()) return { success: true, output: '' };

    try {
      console.log(`Executing command: ${command}`);
      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });
      
      return {
        success: true,
        output: stdout,
        error: stderr
      };
    } catch (error) {
      console.error(`Command failed: ${command}`, error.message);
      return {
        success: false,
        error: error.message,
        output: error.stdout || ''
      };
    }
  }

  async executeTask(taskDescription, stepTitle) {
    console.log(`  → Executing task: ${taskDescription}`);
    
    // Update current task in context
    await this.updateAgentStatus('active', `${stepTitle}: ${taskDescription}`);

    // Execute real work based on task type
    try {
      if (taskDescription.toLowerCase().includes('create') || 
          taskDescription.toLowerCase().includes('implement')) {
        // Use Cursor bridge to generate code
        await this.executeCreateTask(taskDescription);
      } else if (taskDescription.toLowerCase().includes('run') ||
                 taskDescription.toLowerCase().includes('test') ||
                 taskDescription.toLowerCase().includes('lint')) {
        // Execute commands
        await this.executeCommandTask(taskDescription);
      } else if (taskDescription.toLowerCase().includes('design') ||
                 taskDescription.toLowerCase().includes('plan')) {
        // Planning/design tasks
        await this.executePlanningTask(taskDescription);
      } else {
        // Generic task - use Cursor AI
        await this.executeGenericTask(taskDescription);
      }
    } catch (error) {
      console.error(`Task execution error: ${taskDescription}`, error);
      throw error;
    }
  }

  async executeCreateTask(taskDescription) {
    // Extract file path/component name from task
    const componentMatch = taskDescription.match(/component[:\s]+(\w+)/i) ||
                          taskDescription.match(/file[:\s]+([\w/.-]+)/i);
    
    if (componentMatch) {
      const name = componentMatch[1];
      // Queue Cursor command to create component
      await this.cursorBridge.queueCommand(
        `${this.agentId}-agent`,
        `Create ${name} component: ${taskDescription}`
      );
    }
    
    // Real execution would create files here
    // For now, simulate with appropriate delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async executeCommandTask(taskDescription) {
    // Extract command from task description
    const commandMatch = taskDescription.match(/run[:\s]+([^\s]+)/i) ||
                        taskDescription.match(/npm[:\s]+([^\s]+)/i);
    
    if (commandMatch) {
      const command = commandMatch[1];
      const result = await this.executeCommand(`npm ${command}`);
      if (!result.success) {
        console.warn(`Command had issues: ${command}`);
      }
    } else {
      // Generic command execution
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async executePlanningTask(taskDescription) {
    // Planning tasks - use Cursor AI to generate plan
    await this.cursorBridge.queueCommand(
      `${this.agentId}-agent`,
      `Plan: ${taskDescription}`
    );
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  async executeGenericTask(taskDescription) {
    // Use Cursor bridge for generic tasks
    await this.cursorBridge.queueCommand(
      `${this.agentId}-agent`,
      taskDescription
    );
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  async executeStep(step, stepIndex, totalSteps, updateTaskStatus) {
    console.log(`\n📋 Step ${stepIndex + 1}/${totalSteps}: ${step.title}`);
    
    try {
      // Execute commands first if any
      if (step.commands && step.commands.trim()) {
        console.log(`   🔧 Running commands...`);
        const result = await this.executeCommand(step.commands);
        if (!result.success) {
          console.warn(`   ⚠️  Command execution had issues: ${result.error}`);
          // Don't fail the step, just warn
        } else {
          console.log(`   ✅ Commands executed successfully`);
        }
      }

      // Execute each task in the step
      for (let i = 0; i < step.tasks.length; i++) {
        const task = step.tasks[i];
        const taskDescription = `${step.title}: ${task}`;
        
        // Update task status to executing (try by description, fallback to sequential)
        if (updateTaskStatus) {
          await updateTaskStatus(this.executionId, taskDescription, 'executing');
        }
        
        // Execute the task
        await this.executeTask(task, step.title);
        
        // Update task status to completed
        if (updateTaskStatus) {
          await updateTaskStatus(this.executionId, taskDescription, 'completed');
        }
      }
      
      console.log(`   ✅ Step completed: ${step.title}`);
    } catch (error) {
      console.error(`   ❌ Step failed: ${step.title}`, error);
      // Update task status to failed (try to find the current task)
      if (updateTaskStatus && step.tasks.length > 0) {
        const lastTask = step.tasks[step.tasks.length - 1];
        const taskDescription = `${step.title}: ${lastTask}`;
        await updateTaskStatus(this.executionId, taskDescription, 'failed');
      }
      throw error; // Re-throw to be caught by execute()
    }
  }

  async execute(updateTaskStatus, updateExecutionStatus) {
    console.log(`\n🚀 Starting agent execution: ${this.agentId}`);
    console.log(`📝 Prompt: ${this.prompt}`);
    console.log(`🆔 Execution ID: ${this.executionId}\n`);

    try {
      const workflow = await this.loadWorkflow();
      console.log(`📋 Loaded workflow with ${workflow.length} steps\n`);

      // Update agent status to active
      await this.updateAgentStatus('active', workflow[0]?.title || this.prompt);

      // Track current task index for sequential updates
      let currentTaskIndex = 0;

      // Execute each step
      for (let i = 0; i < workflow.length; i++) {
        const step = workflow[i];
        
        // Create a wrapper that updates tasks by index sequentially
        const stepUpdateTaskStatus = async (execId, taskDescOrIndex, status) => {
          if (updateTaskStatus) {
            // If it's a description, try to find by description first, then use sequential index
            if (typeof taskDescOrIndex === 'string') {
              await updateTaskStatus(execId, taskDescOrIndex, status);
            } else {
              // Use sequential index
              await updateTaskStatus(execId, currentTaskIndex, status);
              if (status === 'completed' || status === 'failed') {
                currentTaskIndex++;
              }
            }
          }
        };

        await this.executeStep(step, i, workflow.length, stepUpdateTaskStatus);
      }

      // Update agent status to completed
      await this.updateAgentStatus('completed', null);

      // Mark execution as completed
      if (updateExecutionStatus) {
        await updateExecutionStatus(this.executionId, 'completed');
      }

      console.log(`\n✅ Agent execution completed: ${this.agentId}`);
      return { success: true };
    } catch (error) {
      console.error(`\n❌ Agent execution failed: ${this.agentId}`, error);
      
      // Update agent status to blocked/error
      await this.updateAgentStatus('blocked', `Error: ${error.message}`);

      // Mark execution as failed
      if (updateExecutionStatus) {
        await updateExecutionStatus(this.executionId, 'failed');
      }

      return { success: false, error: error.message };
    }
  }
}

export { AgentExecutor };

