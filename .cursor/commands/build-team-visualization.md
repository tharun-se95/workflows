# Build Team Visualization Dashboard

The engineering team will build a web application to visualize themselves and how they work together.

## Project Requirements:

### Application Purpose:
Build a real-time dashboard that visualizes:
1. **Agent Status Cards** - Show each agent's current status, task, and blockers
2. **Workflow Graph** - Interactive visualization of agent dependencies and workflow
3. **Task Board** - Active, completed, and blocked tasks
4. **Quality Gates** - Status of each quality gate
5. **Project Overview** - Current phase, progress, and project info
6. **Real-time Updates** - Auto-refresh from shared-context.json

### Technical Requirements:

**Frontend:**
- React + TypeScript
- React Flow (for workflow visualization)
- Tailwind CSS (for styling)
- File system API or polling to read `.cursor/agents/shared-context.json`
- Responsive design

**Backend (if needed):**
- Simple API to serve shared-context.json
- WebSocket or polling for real-time updates
- File watcher to detect changes

**Features:**
- Real-time status updates
- Interactive workflow graph
- Color-coded agent statuses
- Task filtering and search
- Quality gate indicators
- Project progress tracking

## Execution Flow:

### Phase 1: Architecture & Planning
- **Architect:** Design dashboard architecture
  - Define component structure
  - Plan data flow
  - Design API (if needed)
  - Create wireframes/mockups

### Phase 2: Setup & Infrastructure
- **DevOps:** Setup project structure
  - Initialize React + TypeScript project
  - Configure build tools (Vite)
  - Setup development environment
  - Configure file watching/polling

### Phase 3: Backend (if needed)
- **Backend Engineer:** Create simple API
  - Endpoint to serve shared-context.json
  - WebSocket or polling endpoint
  - File watcher service
  - CORS configuration

### Phase 4: Frontend Development
- **Frontend Engineer:** Build dashboard components
  - AgentCard component (status, tasks, blockers)
  - WorkflowGraph component (React Flow visualization)
  - TaskBoard component (task tracking)
  - QualityGates component (gate status)
  - ProjectOverview component (project info)
  - Dashboard layout and routing
  - Real-time data fetching

### Phase 5: Integration & Styling
- **Frontend Engineer:** Polish UI
  - Apply Tailwind CSS styling
  - Add animations and transitions
  - Responsive design
  - Dark/light theme (optional)

### Phase 6: Testing
- **QA Engineer:** Write tests
  - Component tests
  - Integration tests
  - E2E tests for dashboard
  - Test data visualization

### Phase 7: Deployment
- **DevOps:** Deploy dashboard
  - Build production bundle
  - Deploy to static hosting (Vercel/Netlify)
  - Configure auto-deployment
  - Setup monitoring

### Phase 8: Documentation
- **Documentation:** Document dashboard
  - User guide
  - Component documentation
  - API documentation (if backend)
  - Update README

## Data Source:

The dashboard reads from:
- `.cursor/agents/shared-context.json` - Agent status and project state
- `.cursor/agents/task-board.md` - Task information
- `.cursor/agents/team-structure.md` - Team member info

## Visual Design:

### Layout:
```
┌─────────────────────────────────────────────────┐
│  🏗️ Engineering Team Dashboard                   │
├─────────────────────────────────────────────────┤
│  Project: [Project Name]                        │
│  Phase: [Current Phase] | Progress: [X]%        │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 🏗️ Arch  │ │ 💾 DB    │ │ 🔧 Backend│      │
│  │ [Status] │ │ [Status] │ │ [Status] │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Workflow Visualization (React Flow)     │  │
│  │  [Interactive graph with dependencies]     │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐           │
│  │ Task Board    │  │ Quality Gates │           │
│  │               │  │              │           │
│  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────┘
```

### Status Colors:
- 🟢 Active/Working
- 🟡 Waiting/Idle
- 🔴 Blocked/Error
- ⚪ Completed
- 🔵 In Progress

## Success Criteria:

- ✅ Dashboard displays all agent statuses
- ✅ Workflow graph shows dependencies correctly
- ✅ Task board updates in real-time
- ✅ Quality gates display current status
- ✅ Responsive design works on all devices
- ✅ Real-time updates work (polling or WebSocket)
- ✅ All tests passing
- ✅ Deployed and accessible

## Usage:

To build the visualization dashboard:
```
/build-team-visualization
```

This will coordinate the team to build the dashboard that visualizes themselves!

## Notes:

- This is a meta-project: the team builds a tool to visualize themselves
- Keep it simple but functional
- Focus on real-time updates
- Make it visually appealing
- Ensure it's useful for monitoring team progress

