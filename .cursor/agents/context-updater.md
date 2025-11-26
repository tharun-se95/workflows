# Context Updater - Live Agent Status Updates

This utility enables agents to automatically update their status in shared-context.json, enabling live visualization.

## Usage in Agent Workflows

When an agent starts working, they should update their status:

```javascript
// At the start of workflow
updateAgentStatus('frontend', {
  status: 'active',
  currentTask: 'Build login component',
  taskUpdate: { action: 'add-active', task: 'Build login component' }
});
```

When completing:
```javascript
updateAgentStatus('frontend', {
  status: 'completed',
  currentTask: null,
  completedTasks: ['Build login component'],
  taskUpdate: { action: 'complete', task: 'Build login component' }
});
```

When blocked:
```javascript
updateAgentStatus('frontend', {
  status: 'blocked',
  blockers: ['Waiting for API contracts'],
  waitingFor: ['backend']
});
```

## CLI Usage

```bash
# Agent starts a task
node .cursor/agents/update-context.js frontend start "Build login component"

# Agent completes a task
node .cursor/agents/update-context.js frontend complete "Build login component"

# Agent encounters blocker
node .cursor/agents/update-context.js frontend block "Waiting for API"

# Manual update
node .cursor/agents/update-context.js frontend update active "Current task"
```

## Integration with Agent Workflows

Agents should call this at key points:
1. **Start of workflow** - Set status to 'active'
2. **During work** - Update currentTask
3. **On completion** - Set status to 'completed', add to completedTasks
4. **On blocker** - Set status to 'blocked', add blockers
5. **On waiting** - Set status to 'waiting', add waitingFor

## Live Visualization

When agents update their status:
- Dashboard polls every 2 seconds
- Server watches file for changes
- Dashboard automatically reflects changes
- Workflow graph updates
- Agent cards update
- Task board updates

