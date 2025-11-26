# API Contracts

## Overview

For the Team Visualization Dashboard, we have two options:

1. **Direct File Reading** - Read JSON files directly (simpler, no backend)
2. **Simple API** - Express server that serves the files (more flexible)

## Option 1: Direct File Reading (Recommended for MVP)

No API needed. The React app reads files directly via:
- Static file serving (if files are in public/)
- File System Access API (browser)
- Or fetch from relative paths

### Data Structure

The app reads from:
- `.cursor/agents/shared-context.json`
- `.cursor/agents/task-board.md` (parsed)
- `.cursor/agents/team-structure.md` (parsed)

## Option 2: Simple API (If Backend Needed)

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### GET /api/context
Get complete shared context.

**Response:**
```json
{
  "project": {
    "name": "Team Visualization Dashboard",
    "status": "in-progress",
    "currentPhase": "architecture",
    "description": "..."
  },
  "agents": {
    "architect": {
      "status": "active",
      "currentTask": "...",
      "completedTasks": [],
      "blockers": [],
      "lastUpdate": "2025-11-25T12:45:00Z"
    },
    ...
  },
  "tasks": {
    "active": [],
    "completed": [],
    "blocked": [],
    "backlog": []
  },
  "qualityGates": {
    "architecture": "pending",
    "database": "pending",
    ...
  }
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

#### GET /api/tasks
Get task board data.

**Response:**
```json
{
  "active": [
    {
      "id": "task-1",
      "title": "Design dashboard architecture",
      "agent": "architect",
      "status": "in-progress"
    }
  ],
  "completed": [],
  "blocked": [],
  "backlog": []
}
```

#### GET /api/agents/:agentId
Get specific agent status.

**Parameters:**
- `agentId` - Agent identifier (architect, frontend, backend, etc.)

**Response:**
```json
{
  "status": "active",
  "currentTask": "Design dashboard architecture",
  "completedTasks": [],
  "blockers": [],
  "lastUpdate": "2025-11-25T12:45:00Z"
}
```

#### GET /api/quality-gates
Get quality gate statuses.

**Response:**
```json
{
  "architecture": "pending",
  "database": "pending",
  "backend": "pending",
  "frontend": "pending",
  "qa": "pending",
  "deployment": "pending"
}
```

### WebSocket (Optional)

#### Connection
```
ws://localhost:3001/ws
```

#### Events

**Client → Server:**
- `subscribe` - Subscribe to updates
- `unsubscribe` - Unsubscribe from updates

**Server → Client:**
- `context-updated` - Shared context changed
- `agent-status-changed` - Agent status updated
- `task-updated` - Task status changed

**Example:**
```json
{
  "type": "context-updated",
  "data": {
    "project": {...},
    "agents": {...}
  }
}
```

## Data Models

### Agent Status
```typescript
type AgentStatus = "idle" | "active" | "waiting" | "blocked" | "completed";

interface Agent {
  status: AgentStatus;
  currentTask: string | null;
  completedTasks: string[];
  blockers: string[];
  lastUpdate: string | null;
  waitingFor?: string[];
}
```

### Project
```typescript
interface Project {
  name: string;
  status: "planning" | "in-progress" | "completed";
  currentPhase: string;
  description: string;
}
```

### Task
```typescript
interface Task {
  id: string;
  title: string;
  agent: string;
  status: "active" | "completed" | "blocked" | "backlog";
  dependencies?: string[];
}
```

### Quality Gate
```typescript
type QualityGateStatus = "pending" | "approved" | "passed" | "failed";

interface QualityGates {
  architecture: QualityGateStatus;
  database: QualityGateStatus;
  backend: QualityGateStatus;
  frontend: QualityGateStatus;
  qa: QualityGateStatus;
  deployment: QualityGateStatus;
}
```

## Implementation Notes

### Polling Strategy
- Poll `/api/context` every 2-5 seconds
- Use React Query for automatic polling
- Show loading indicator during fetch
- Handle errors gracefully

### Caching
- Cache responses for 1-2 seconds
- Invalidate on error
- Use React Query cache

### Error Handling
- Retry failed requests (3 attempts)
- Show error message to user
- Fallback to cached data if available

