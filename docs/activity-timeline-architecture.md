# Activity Timeline Feature - Architecture Design

## Overview

The Activity Timeline feature provides a real-time chronological feed of all agent activities, enabling better monitoring and debugging of the agent workflow system.

## Requirements Analysis

### Functional Requirements:
1. Display chronological activity feed
2. Show agent actions (started, completed, blocked, assigned)
3. Filter by agent, date, action type
4. Search functionality
5. Real-time updates
6. Export logs capability

### Non-Functional Requirements:
1. Performance: Handle 1000+ activities efficiently
2. Real-time: Updates within 2 seconds
3. Responsive: Works on all screen sizes
4. Accessible: Keyboard navigation, screen reader support

## Architecture Design

### Component Structure

```
ActivityTimeline
├── ActivityTimelineHeader
│   ├── SearchInput
│   ├── FilterDropdowns (Agent, Date, Action)
│   └── ExportButton
├── ActivityList
│   └── ActivityItem (xN)
│       ├── Timestamp
│       ├── AgentBadge
│       ├── ActionIcon
│       ├── ActionDescription
│       └── TaskLink (if applicable)
└── ActivityTimelineFooter
    └── LoadMoreButton (for pagination)
```

### Data Model

```typescript
interface ActivityLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  action: 'started' | 'completed' | 'blocked' | 'assigned' | 'updated' | 'failed';
  task?: string;
  details?: string;
  metadata?: {
    executionId?: string;
    taskId?: string;
    duration?: number;
  };
}

interface ActivityFilters {
  agentId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
```

### Data Flow

```
Agent Action → Update shared-context.json → Server watches file → 
API endpoint → Dashboard polls → ActivityTimeline component → 
Display activity
```

## API Design

### Endpoints

#### GET /api/activity-logs
Get activity logs with filtering.

**Query Parameters:**
- `agentId` (optional) - Filter by agent
- `action` (optional) - Filter by action type
- `dateFrom` (optional) - Start date (ISO format)
- `dateTo` (optional) - End date (ISO format)
- `search` (optional) - Search in details
- `limit` (optional) - Number of results (default: 100)
- `offset` (optional) - Pagination offset

**Response:**
```json
{
  "activities": [
    {
      "id": "activity-1",
      "timestamp": "2025-11-25T14:30:00Z",
      "agentId": "frontend",
      "agentName": "Frontend Engineer",
      "action": "started",
      "task": "Build PromptTemplates component",
      "details": "Started building template library UI"
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

#### POST /api/activity-logs
Create new activity log (called by agents).

**Request Body:**
```json
{
  "agentId": "frontend",
  "action": "started",
  "task": "Build component",
  "details": "Starting work"
}
```

**Response:**
```json
{
  "id": "activity-123",
  "timestamp": "2025-11-25T14:30:00Z",
  "success": true
}
```

## Storage Design

### File-Based Storage (Current)
- Store in `.cursor/agents/activity-logs.json`
- Array of activity objects
- Append-only log
- Rotate after 10,000 entries

### Future: Database Option
- SQLite for local storage
- PostgreSQL for production
- Indexed by timestamp, agentId, action

## Component Design

### ActivityTimeline Component

**Props:**
```typescript
interface ActivityTimelineProps {
  initialActivities?: ActivityLog[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}
```

**State:**
- activities: ActivityLog[]
- filters: ActivityFilters
- loading: boolean
- error: Error | null

**Features:**
- Virtual scrolling for performance
- Real-time updates via polling
- Filter and search
- Export to CSV/JSON

### ActivityItem Component

**Props:**
```typescript
interface ActivityItemProps {
  activity: ActivityLog;
  onTaskClick?: (taskId: string) => void;
}
```

**Visual Design:**
- Timeline connector line
- Color-coded by action type
- Agent avatar/badge
- Action icon
- Collapsible details

## Integration Points

### With Existing Components:
1. **AgentCard** - Click to filter timeline by agent
2. **TaskBoard** - Click task to see related activities
3. **WorkflowGraph** - Highlight activities in graph
4. **Dashboard** - Add timeline section

### With Agent System:
- Agents call API to log activities
- Context updater logs activities automatically
- Task executor logs task activities

## Performance Considerations

1. **Virtual Scrolling:** Use react-window for large lists
2. **Pagination:** Load 100 items at a time
3. **Debouncing:** Debounce search input
4. **Memoization:** Memoize filtered results
5. **Lazy Loading:** Load older activities on scroll

## Security Considerations

- No authentication needed (internal tool)
- Input validation on search/filters
- Sanitize activity details
- Rate limiting on POST endpoint

## Future Enhancements

1. WebSocket for real-time push
2. Activity analytics dashboard
3. Activity patterns detection
4. Automated alerts on errors
5. Activity replay functionality

## Technology Choices

- **Frontend:** React + TypeScript (existing)
- **Styling:** Tailwind CSS (existing)
- **Virtual Scrolling:** react-window
- **Date Handling:** date-fns
- **Icons:** Heroicons or Lucide React

## Implementation Phases

### Phase 1: Basic Timeline
- Display activities chronologically
- Basic filtering
- Real-time updates

### Phase 2: Advanced Features
- Search functionality
- Date range filtering
- Export capability

### Phase 3: Performance & Polish
- Virtual scrolling
- Pagination
- Performance optimization

## Success Criteria

- ✅ Activities display in chronological order
- ✅ Real-time updates work (< 2s delay)
- ✅ Filtering works correctly
- ✅ Search finds relevant activities
- ✅ Export generates valid files
- ✅ Performance: 60fps with 1000+ activities
- ✅ Responsive on all screen sizes

