# Team Orchestrator

Coordinates the entire engineering team to build the application.

## How It Works:

The orchestrator manages the team by:
1. Reading shared context to understand current state
2. Assigning tasks to appropriate agents
3. Managing dependencies between agents
4. Ensuring quality gates are met
5. Coordinating handoffs between agents

## Workflow Phases:

### Phase 1: Planning & Architecture
1. **Architect Agent:**
   - Analyze requirements
   - Design architecture
   - Create API contracts
   - Design database schema
   - Update shared context
   - Mark quality gate: `architecture = "approved"`

### Phase 2: Parallel Development
2. **Database Engineer** (can start after Architect begins):
   - Review schema design from Architect
   - Create migrations
   - Optimize schema
   - Update shared context
   - Mark quality gate: `database = "approved"`

3. **DevOps Engineer** (early setup):
   - Setup CI/CD structure
   - Configure environments
   - Prepare deployment configs
   - Can work in parallel with others

### Phase 3: Backend Development
4. **Backend Engineer** (waits for Database):
   - Check: Database schema ready?
   - Review database schema
   - Implement API endpoints
   - Add authentication
   - Update API documentation
   - Run quality checks (AUTOMATIC)
   - Update shared context
   - Notify Frontend Engineer
   - Mark quality gate: `backend = "passed"`

### Phase 4: Frontend Development
5. **Frontend Engineer** (waits for Backend):
   - Check: API contracts ready?
   - Review API contracts
   - Build UI components
   - Integrate APIs
   - Implement state management
   - Run quality checks (AUTOMATIC)
   - Update shared context
   - Notify QA Engineer
   - Mark quality gate: `frontend = "passed"`

### Phase 5: Quality Assurance
6. **QA Engineer** (waits for Frontend + Backend):
   - Check: Features complete?
   - Write tests
   - Run test suite
   - Perform quality checks
   - Report results
   - Update shared context
   - Mark quality gate: `qa = "passed"`

### Phase 6: Deployment
7. **DevOps Engineer** (final deployment):
   - Check: All code ready? Tests passing?
   - Build application
   - Run tests
   - Deploy to staging
   - Deploy to production
   - Monitor deployment
   - Mark quality gate: `deployment = "successful"`

### Phase 7: Documentation (Continuous)
8. **Documentation Agent** (works throughout):
   - Document APIs
   - Update README
   - Create user guides
   - Maintain changelog
   - Document architecture

## Execution Steps:

1. **Read Current State:**
   - Read `.cursor/agents/shared-context.json`
   - Read `.cursor/agents/task-board.md`
   - Identify current phase

2. **Assign Tasks:**
   - Determine which agents can work
   - Check dependencies
   - Assign tasks to ready agents
   - Update task board

3. **Monitor Progress:**
   - Check agent status
   - Handle blockers
   - Resolve conflicts
   - Track completion

4. **Quality Gates:**
   - Verify quality gates are met
   - Block progression if gates fail
   - Require fixes before proceeding

5. **Coordinate Handoffs:**
   - When Agent A completes → notify Agent B
   - Update shared context
   - Update task board
   - Ensure smooth transitions

## Usage:

To start orchestrating the team:
```
/orchestrate-team
```

Or to assign a specific agent:
```
/architect-agent
/frontend-engineer-agent
/backend-engineer-agent
/database-engineer-agent
/devops-engineer-agent
/qa-engineer-agent
/documentation-agent
```

## Quality Gate Enforcement:

- **Architecture** must be approved before development starts
- **Database** schema must be approved before backend development
- **Backend** APIs must pass quality checks before frontend integration
- **Frontend** must pass quality checks before QA
- **QA** tests must pass before deployment
- **Deployment** must succeed before marking complete

## Conflict Resolution:

- If agents disagree: Architect makes final decision
- If blocked: Report to orchestrator, reassign or create new tasks
- If quality fails: Fix issues, re-run checks, don't proceed until passed

