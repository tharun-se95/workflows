# Agent Communication Protocol

## Message Types:

### 1. Task Assignment
```json
{
  "type": "task_assignment",
  "from": "orchestrator",
  "to": "backend_engineer",
  "task": "Implement user authentication API",
  "dependencies": ["database_schema"],
  "deadline": null,
  "priority": "high"
}
```

### 2. Task Completion
```json
{
  "type": "task_completion",
  "from": "backend_engineer",
  "to": "orchestrator",
  "task": "Implement user authentication API",
  "status": "completed",
  "outputs": ["auth_api.ts", "auth_controller.ts"],
  "next_agent": "frontend_engineer"
}
```

### 3. Dependency Request
```json
{
  "type": "dependency_request",
  "from": "frontend_engineer",
  "to": "backend_engineer",
  "request": "API contracts for user endpoints",
  "status": "waiting"
}
```

### 4. Blocker Report
```json
{
  "type": "blocker",
  "from": "backend_engineer",
  "to": "orchestrator",
  "issue": "Database schema not ready",
  "blocked_task": "Implement user API",
  "needs": "database_schema"
}
```

### 5. Quality Check Request
```json
{
  "type": "quality_check",
  "from": "frontend_engineer",
  "to": "qa_engineer",
  "component": "LoginForm",
  "files": ["src/components/LoginForm.tsx"]
}
```

## Communication Flow:

```
Agent A completes task
    ↓
Updates shared context
    ↓
Notifies next agent (Agent B)
    ↓
Agent B reviews work
    ↓
Agent B acknowledges
    ↓
Agent B starts work
```

## Conflict Resolution:

1. **Technical Disagreement:**
   - Agents discuss in shared context
   - Architect makes final decision
   - Document decision

2. **Blocked Task:**
   - Agent reports blocker
   - Orchestrator reassigns or creates new task
   - Update task board

3. **Quality Issues:**
   - QA Engineer reports issues
   - Original agent fixes issues
   - QA Engineer verifies fixes

## Notification System:

Agents should update shared context when:
- Starting a task
- Completing a task
- Encountering a blocker
- Requesting a dependency
- Reporting quality issues

