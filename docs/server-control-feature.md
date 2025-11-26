# Server Control Feature

## ✅ Feature Added: Kill and Run Servers

Added the ability to control servers and databases directly from the dashboard UI.

## Features

### Server Control Actions

1. **Start** - Start a stopped server/database
2. **Stop** - Gracefully stop a running server/database
3. **Kill** - Forcefully kill a running server/database (immediate stop)
4. **Restart** - Restart a running server/database

### UI Controls

- Control buttons appear on each server/database card
- Buttons are context-aware (only show relevant actions)
- Visual feedback during state transitions
- Disabled buttons during transitions (starting/stopping)

## API Endpoints

### Servers

```
POST /api/infrastructure/servers/:serverId/:action
```

**Actions:** `start`, `stop`, `kill`, `restart`

**Example:**
```bash
POST /api/infrastructure/servers/api-server/stop
POST /api/infrastructure/servers/api-server/kill
POST /api/infrastructure/servers/api-server/start
POST /api/infrastructure/servers/api-server/restart
```

### Databases

```
POST /api/infrastructure/databases/:databaseId/:action
```

**Actions:** `start`, `stop`, `kill`, `restart`

**Example:**
```bash
POST /api/infrastructure/databases/postgres-main/stop
POST /api/infrastructure/databases/redis-cache/kill
```

## Server States

- **running** → Can: Stop, Kill, Restart
- **stopped** → Can: Start
- **error** → Can: Start
- **starting** → No actions (transition state)
- **stopping** → No actions (transition state)

## Behavior

### Start
- Status: `stopped/error` → `starting` → `running`
- Duration: ~2 seconds
- Resets uptime to 0

### Stop
- Status: `running` → `stopping` → `stopped`
- Duration: ~1.5 seconds
- Sets CPU/Memory to 0

### Kill
- Status: `running` → `stopped` (immediate)
- No transition state
- Sets CPU/Memory to 0

### Restart
- Status: `running` → `stopping` → `starting` → `running`
- Duration: ~3.5 seconds total
- Resets uptime to 0

## Visual Feedback

- **Green button** - Start action
- **Yellow button** - Stop action
- **Red button** - Kill action
- **Blue button** - Restart action
- **Disabled state** - During transitions or when action not available
- **Loading indicator** - Shows "..." while action is processing

## Activity Logging

All server/database control actions are logged to the activity timeline:
- Agent: `devops`
- Action: `updated`
- Details: Status change information

## Example Usage

1. **Stop API Server:**
   - Click "Stop" button on API Server card
   - Status changes: `running` → `stopping` → `stopped`
   - CPU/Memory reset to 0

2. **Kill Frontend Server:**
   - Click "Kill" button on Frontend Server card
   - Status changes: `running` → `stopped` (immediate)
   - No transition state

3. **Restart Backend Service:**
   - Click "Restart" button on Backend Service card
   - Status changes: `running` → `stopping` → `starting` → `running`
   - Uptime resets to 0

## Error Handling

- Invalid actions return 400 error
- Server/database not found returns 404 error
- Action not allowed for current state returns 400 error
- Errors are displayed as alerts to the user

## Real-Time Updates

- Status changes are immediately saved to `shared-context.json`
- Dashboard polling (every 2 seconds) picks up changes automatically
- No page refresh needed

---

**Server control feature is now live!** 🎉

You can now start, stop, kill, and restart servers/databases directly from the dashboard.

