# Activity Timeline API Contracts

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### GET /api/activity-logs

Get activity logs with optional filtering and pagination.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agentId | string | No | Filter by agent ID |
| action | string | No | Filter by action type (started, completed, blocked, etc.) |
| dateFrom | string (ISO) | No | Start date for filtering |
| dateTo | string (ISO) | No | End date for filtering |
| search | string | No | Search in task and details fields |
| limit | number | No | Number of results (default: 100, max: 500) |
| offset | number | No | Pagination offset (default: 0) |

**Response:**
```json
{
  "activities": [
    {
      "id": "activity-20251125-143000-frontend-1",
      "timestamp": "2025-11-25T14:30:00Z",
      "agentId": "frontend",
      "agentName": "Frontend Engineer",
      "action": "started",
      "task": "Build PromptTemplates component",
      "details": "Started building template library UI with search and filters",
      "metadata": {
        "executionId": "exec-123",
        "taskId": "task-456"
      }
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0,
  "hasMore": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid query parameters
- `500` - Server error

### POST /api/activity-logs

Create a new activity log entry.

**Request Body:**
```json
{
  "agentId": "frontend",
  "action": "started",
  "task": "Build component",
  "details": "Starting work on new feature",
  "metadata": {
    "executionId": "exec-123",
    "taskId": "task-456"
  }
}
```

**Response:**
```json
{
  "id": "activity-20251125-143000-frontend-1",
  "timestamp": "2025-11-25T14:30:00Z",
  "success": true
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid request body
- `500` - Server error

### GET /api/activity-logs/stats

Get activity statistics.

**Query Parameters:**
- `dateFrom` (optional) - Start date
- `dateTo` (optional) - End date

**Response:**
```json
{
  "totalActivities": 150,
  "activitiesByAgent": {
    "frontend": 45,
    "backend": 30,
    "architect": 25,
    "qa": 20,
    "devops": 15,
    "database": 10,
    "documentation": 5
  },
  "activitiesByAction": {
    "started": 50,
    "completed": 40,
    "blocked": 10,
    "assigned": 30,
    "updated": 20
  },
  "timeRange": {
    "from": "2025-11-25T00:00:00Z",
    "to": "2025-11-25T23:59:59Z"
  }
}
```

### GET /api/activity-logs/export

Export activity logs.

**Query Parameters:** Same as GET /api/activity-logs

**Response:** CSV or JSON file download

**Headers:**
- `Content-Type: text/csv` or `application/json`
- `Content-Disposition: attachment; filename="activity-logs-2025-11-25.csv"`

## Data Models

### ActivityLog
```typescript
interface ActivityLog {
  id: string;                    // Unique identifier
  timestamp: string;             // ISO 8601 timestamp
  agentId: string;               // Agent identifier
  agentName: string;              // Human-readable agent name
  action: ActivityAction;        // Action type
  task?: string;                 // Task description (optional)
  details?: string;              // Additional details (optional)
  metadata?: {                   // Additional metadata (optional)
    executionId?: string;
    taskId?: string;
    duration?: number;
    error?: string;
  };
}
```

### ActivityAction
```typescript
type ActivityAction = 
  | 'started'      // Agent started a task
  | 'completed'    // Agent completed a task
  | 'blocked'       // Agent encountered a blocker
  | 'assigned'      // Task was assigned to agent
  | 'updated'       // Agent updated status
  | 'failed';       // Task failed
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid query parameter",
  "details": "dateFrom must be a valid ISO 8601 date"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Failed to read activity logs file"
}
```

## Rate Limiting

- GET requests: 100 requests/minute
- POST requests: 50 requests/minute

## Versioning

Current version: `v1`

Future versions will be specified in URL: `/api/v2/activity-logs`

