# Server Startup Guide

## ✅ Server Status

The API server is now running on `http://localhost:3001`

## 🚀 How to Start the Server

### Option 1: Using npm script (Recommended)

```bash
cd team-visualization-dashboard
npm run server
```

### Option 2: Using concurrently (Both server + frontend)

```bash
cd team-visualization-dashboard
npm run dev:full
```

### Option 3: Manual start

```bash
cd team-visualization-dashboard
node server.js
```

## 📋 Server Endpoints

- `GET /api/health` - Health check
- `GET /api/context` - Get shared context
- `GET /api/executions` - Get all task executions
- `GET /api/executions/:id` - Get specific execution
- `POST /api/agents/:id/trigger` - Trigger agent execution
- `GET /api/activity-logs` - Get activity logs
- `POST /api/activity-logs` - Create activity log
- `GET /api/prompt-templates` - Get prompt templates

## 🔧 Troubleshooting

### Server Won't Start

1. **Check if port 3001 is in use:**
   ```powershell
   netstat -ano | findstr :3001
   ```

2. **Check for errors:**
   ```bash
   node server.js
   ```

3. **Check dependencies:**
   ```bash
   npm install
   ```

### Server Starts But Dashboard Shows Error

1. **Check server logs** - Look for error messages
2. **Verify shared-context.json exists:**
   ```bash
   Test-Path .cursor/agents/shared-context.json
   ```
3. **Check file permissions** - Ensure server can read/write files

### Dashboard Shows "Failed to Fetch"

1. **Verify server is running:**
   ```powershell
   Invoke-WebRequest -Uri http://localhost:3001/api/health
   ```

2. **Check CORS settings** - Server should have CORS enabled

3. **Check browser console** - Look for specific error messages

## ✅ Verification

Once server is running, you should see:
- ✅ Dashboard loads without errors
- ✅ All executions visible
- ✅ Activity timeline shows activities
- ✅ Agent cards show correct status
- ✅ Real-time updates working

---

**The server is now running and the dashboard should be working!** 🎉

