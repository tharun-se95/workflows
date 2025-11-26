# Troubleshooting: "Create Task List" Not Working

## Quick Checks:

### 1. Is the API Server Running?
Check if the server is running on port 3001:
```bash
# In team-visualization-dashboard directory
npm run server
```

You should see:
```
🚀 API server running on http://localhost:3001
📊 Serving shared context from: ...
📋 Task executions stored in: ...
```

### 2. Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors:
- Network errors (CORS, connection refused)
- API errors (404, 500)
- JavaScript errors

### 3. Test API Endpoint Manually
Open browser and go to:
```
http://localhost:3001/api/executions
```

Should return: `[]` (empty array) or a list of executions.

### 4. Test with curl (if available)
```bash
curl -X POST http://localhost:3001/api/agents/frontend/trigger \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Build a login component"}'
```

## Common Issues:

### Issue 1: Server Not Running
**Symptom:** Button does nothing, no console errors
**Solution:** Start the server:
```bash
cd team-visualization-dashboard
npm run server
```

### Issue 2: CORS Error
**Symptom:** Console shows CORS error
**Solution:** Server already has CORS enabled, but check if port matches:
- Frontend: `http://localhost:3000` (or Vite default)
- Backend: `http://localhost:3001`

### Issue 3: Port Already in Use
**Symptom:** Server fails to start
**Solution:** Kill process on port 3001 or change PORT in server.js

### Issue 4: File Permissions
**Symptom:** Server starts but can't write task-executions.json
**Solution:** Check file permissions for `.cursor/agents/` directory

## Debug Steps:

1. **Check Server Logs:**
   - Look at terminal where server is running
   - Should see: "Shared context file changed, reloading..." when you trigger

2. **Check Network Tab:**
   - Open DevTools → Network tab
   - Click "Create Task List"
   - Look for POST request to `/api/agents/:agentId/trigger`
   - Check response status and body

3. **Check Console Logs:**
   - Added console.log statements in Dashboard.tsx
   - Should see: "Triggering agent:", "Response status:", "Task list created:"

4. **Verify File Creation:**
   - Check if `.cursor/agents/task-executions.json` is created
   - Should contain execution data after clicking button

## Still Not Working?

1. Restart both servers:
   ```bash
   # Stop both (Ctrl+C)
   # Then restart:
   npm run dev:full
   ```

2. Clear browser cache and reload

3. Check if port 3001 is accessible:
   ```bash
   # Windows PowerShell:
   Test-NetConnection -ComputerName localhost -Port 3001
   ```

4. Verify API_BASE_URL in Dashboard.tsx matches your server port

