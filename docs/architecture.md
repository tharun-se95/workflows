# Team Visualization Dashboard - Architecture

## Overview

A real-time web dashboard that visualizes the engineering team agents and their collaboration. The dashboard reads from shared context files and displays agent status, workflow dependencies, tasks, and quality gates.

## System Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────┐
│              Browser (React App)                  │
│  ┌──────────────────────────────────────────┐    │
│  │  Dashboard Components                    │    │
│  │  - AgentCards                             │    │
│  │  - WorkflowGraph                          │    │
│  │  - TaskBoard                              │    │
│  │  - QualityGates                           │    │
│  │  - ProjectOverview                        │    │
│  └──────────────────────────────────────────┘    │
│              ↕ (Polling/File API)                 │
└─────────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────────┐
│         File System (.cursor/agents/)           │
│  - shared-context.json                          │
│  - task-board.md                                │
│  - team-structure.md                            │
└─────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Flow** - Workflow graph visualization
- **Tailwind CSS** - Styling
- **Axios/Fetch** - Data fetching (if using API)
- **React Query** (optional) - Data synchronization

### Backend (Optional)
- **Node.js + Express** - Simple API server (if needed)
- **chokidar** - File system watcher
- **WebSocket** (optional) - Real-time updates

### Deployment
- **Vercel/Netlify** - Static hosting
- **GitHub Actions** - CI/CD (optional)

## Component Architecture

### Component Hierarchy

```
Dashboard (App)
├── Header
│   ├── ProjectOverview
│   └── Navigation
├── Main Content
│   ├── AgentStatusGrid
│   │   └── AgentCard (x7)
│   ├── WorkflowVisualization
│   │   └── WorkflowGraph (React Flow)
│   └── Bottom Section
│       ├── TaskBoard
│       └── QualityGates
└── Footer
```

### Core Components

1. **AgentCard**
   - Displays agent status, current task, blockers
   - Color-coded status indicators
   - Click to expand details

2. **WorkflowGraph**
   - Interactive React Flow visualization
   - Shows agent dependencies
   - Highlights active workflow path
   - Color-coded nodes by status

3. **TaskBoard**
   - Displays active, completed, blocked tasks
   - Filterable by agent
   - Real-time updates

4. **QualityGates**
   - Shows status of each quality gate
   - Visual indicators (pending/approved/passed)

5. **ProjectOverview**
   - Project name and description
   - Current phase
   - Overall progress percentage

## Data Flow

### Data Sources
1. `.cursor/agents/shared-context.json` - Primary data source
   - Agent statuses
   - Tasks
   - Quality gates
   - Project info

2. `.cursor/agents/task-board.md` - Task details
   - Task descriptions
   - Task status

3. `.cursor/agents/team-structure.md` - Team metadata
   - Agent roles
   - Responsibilities

### Data Fetching Strategy

**Option 1: Direct File Reading (Simple)**
- Use File System Access API (browser)
- Or serve files via static hosting
- Poll every 2-5 seconds

**Option 2: Simple API (Recommended)**
- Express server reads files
- Endpoint: `GET /api/context`
- Polling: `GET /api/context` every 2 seconds
- Optional: WebSocket for push updates

### State Management
- React Context or Zustand for global state
- React Query for data synchronization
- Local state for UI interactions

## API Design (If Backend Needed)

### Endpoints

```
GET /api/context
Response: {
  project: {...},
  agents: {...},
  tasks: {...},
  qualityGates: {...}
}

GET /api/tasks
Response: {
  active: [...],
  completed: [...],
  blocked: [...]
}

GET /api/agents/:agentId
Response: {
  status: "active",
  currentTask: "...",
  ...
}
```

## File Structure

```
team-visualization-dashboard/
├── src/
│   ├── components/
│   │   ├── AgentCard.tsx
│   │   ├── WorkflowGraph.tsx
│   │   ├── TaskBoard.tsx
│   │   ├── QualityGates.tsx
│   │   ├── ProjectOverview.tsx
│   │   └── Dashboard.tsx
│   ├── hooks/
│   │   ├── useSharedContext.ts
│   │   └── usePolling.ts
│   ├── types/
│   │   └── types.ts
│   ├── utils/
│   │   ├── statusColors.ts
│   │   └── dataTransformers.ts
│   ├── services/
│   │   └── api.ts (if backend)
│   ├── App.tsx
│   └── main.tsx
├── public/
├── docs/
│   └── architecture.md
├── package.json
├── vite.config.ts
└── README.md
```

## Design Decisions

### 1. No Database Required
- Data is stored in JSON/Markdown files
- Simple file-based approach
- Easy to version control

### 2. Polling vs WebSocket
- Start with polling (simpler)
- Can upgrade to WebSocket later
- Poll interval: 2-5 seconds

### 3. Static vs Dynamic
- Static React app (can be enhanced with API)
- Can read files directly or via API
- Deploy as static site

### 4. Real-time Updates
- Polling mechanism
- Visual indicators for updates
- Smooth transitions

## Security Considerations

- No authentication needed (internal tool)
- CORS if using API
- File path validation
- Input sanitization

## Performance Considerations

- Lazy load components
- Memoize expensive computations
- Optimize React Flow rendering
- Debounce polling if needed

## Future Enhancements

- WebSocket for real-time push
- Historical data tracking
- Agent activity timeline
- Export functionality
- Customizable views

