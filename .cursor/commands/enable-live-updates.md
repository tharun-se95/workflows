# Enable Live Agent Updates

Configure agents to automatically update shared-context.json for live visualization.

## How It Works:

1. **Agent starts workflow** → Updates status to "active"
2. **Agent works on task** → Updates currentTask
3. **Agent completes** → Updates status to "completed", moves task
4. **Agent blocked** → Updates status to "blocked", adds blockers
5. **Dashboard** → Polls every 2s, shows live updates

## Integration Steps:

### Step 1: Update Agent Workflows

Each agent workflow should update shared context at key points:

**Example for Frontend Engineer:**
```markdown
# Frontend Engineer Workflow

1. **Start Work:**
   - Update shared context: status = "active", currentTask = "Build component"
   - Use: `updateAgentStatus('frontend', { status: 'active', currentTask: '...' })`

2. **During Work:**
   - Update currentTask as needed
   - Add completedTasks when finishing sub-tasks

3. **Complete Work:**
   - Update shared context: status = "completed", currentTask = null
   - Move task from active to completed
```

### Step 2: Use Context Updater

Agents can use the context updater utility:

```bash
# In agent workflow, add:
node .cursor/agents/update-context.js <agentId> start "<task name>"
```

### Step 3: Verify Live Updates

1. Start dashboard: `npm run server` and `npm run dev`
2. Execute agent workflow: `/frontend-engineer-agent`
3. Watch dashboard update in real-time!

## Current Status:

✅ **Dashboard supports live updates** (polls every 2s)
✅ **Server watches file changes** (detects updates)
✅ **Context updater utility created** (ready to use)
⏳ **Agent workflows need integration** (to call updater)

## Next Steps:

To enable truly live visualization:
1. Integrate context updater into agent workflows
2. Agents update status when starting/completing tasks
3. Dashboard automatically shows changes

## Manual Testing:

You can manually test live updates:

```bash
# Terminal 1: Watch dashboard
cd team-visualization-dashboard
npm run server
npm run dev

# Terminal 2: Update agent status
node .cursor/agents/update-context.js frontend start "Building new feature"
# Watch dashboard update!

node .cursor/agents/update-context.js frontend complete "Building new feature"
# Watch dashboard update again!
```

---

**The infrastructure is ready!** Agents just need to call the updater when they work.

