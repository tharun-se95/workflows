# Agent Coordination Protocol

## Communication Channels:

### 1. **Shared Context File**
Location: `.cursor/agents/shared-context.json`
- Current project state
- Assigned tasks
- Completed work
- Blockers and dependencies
- API contracts
- Database schemas

### 2. **Task Board**
Location: `.cursor/agents/task-board.md`
- Active tasks
- Assigned agents
- Task status
- Dependencies
- Completion criteria

### 3. **Agent Handoff Protocol**
When Agent A completes work that Agent B needs:
1. Agent A updates shared context
2. Agent A marks task as "ready for handoff"
3. Agent B is notified
4. Agent B reviews work
5. Agent B acknowledges and proceeds

## Task Assignment Rules:

1. **Architect** starts first - defines overall structure
2. **Database Engineer** works in parallel with Architect
3. **Backend Engineer** waits for database schema
4. **Frontend Engineer** waits for API contracts
5. **QA Engineer** works after features are complete
6. **DevOps Engineer** sets up infrastructure early, deploys at end
7. **Documentation Agent** works continuously

## Conflict Resolution:
- If agents disagree, Architect makes final decision
- If blocked, agent reports to orchestrator
- Orchestrator reassigns or creates new tasks

## Quality Gates:
- Architecture must be approved before development
- Database schema must be reviewed before backend development
- APIs must pass quality checks before frontend integration
- Frontend must pass quality checks before QA
- Tests must pass before deployment
- Deployment must succeed before marking complete

