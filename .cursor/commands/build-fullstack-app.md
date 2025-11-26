# Build Full-Stack Application

Master workflow that orchestrates the entire team to build a full-stack application.

## Overview:

This workflow coordinates all engineering agents to build a complete full-stack application from scratch.

## Execution Flow:

### Step 1: Initialize Project
- **Orchestrator** reads project requirements
- **Architect** designs system architecture
- **DevOps** sets up project structure
- **Documentation** creates initial README

### Step 2: Database Setup
- **Architect** designs database schema
- **Database Engineer** creates migrations
- **Backend Engineer** reviews schema
- Quality gate: Database schema approved

### Step 3: Backend Development
- **Backend Engineer** implements APIs:
  - Authentication API
  - Document upload API
  - Camera scan API
  - RAG indexing API
  - RAG chatbot API
- **QA Engineer** writes backend tests
- **Documentation** documents APIs
- Quality gate: Backend APIs pass quality checks

### Step 4: Frontend Development
- **Frontend Engineer** builds UI:
  - Login/signup screens
  - Document list screen
  - Document upload screen
  - Camera scan screen
  - Chatbot interface
- **Frontend Engineer** integrates APIs
- Quality gate: Frontend passes quality checks

### Step 5: Integration & Testing
- **QA Engineer** runs integration tests
- **QA Engineer** performs E2E testing
- Fix any integration issues
- Quality gate: All tests pass

### Step 6: Deployment
- **DevOps** builds application
- **DevOps** runs tests
- **DevOps** deploys to staging
- **QA Engineer** tests on staging
- **DevOps** deploys to production
- Quality gate: Deployment successful

### Step 7: Documentation
- **Documentation** completes all documentation
- **Documentation** creates user guides
- **Documentation** updates changelog

## Usage:

To build the entire application:
```
/build-fullstack-app
```

This will:
1. Coordinate all agents
2. Manage dependencies
3. Ensure quality gates
4. Handle handoffs
5. Track progress

## Example: Building User Authentication Feature

```
1. You: "Build user authentication feature"
   ↓
2. Orchestrator: Assigns to Architect
   ↓
3. Architect: Designs auth flow, creates API contract
   ↓
4. Orchestrator: Assigns to Database Engineer
   ↓
5. Database Engineer: Creates user table migration
   ↓
6. Orchestrator: Assigns to Backend Engineer
   ↓
7. Backend Engineer: Implements auth API
   ↓
8. Backend Engineer: Runs quality checks (AUTOMATIC)
   ↓
9. Orchestrator: Assigns to Frontend Engineer
   ↓
10. Frontend Engineer: Builds login/signup UI
   ↓
11. Frontend Engineer: Runs quality checks (AUTOMATIC)
   ↓
12. Orchestrator: Assigns to QA Engineer
   ↓
13. QA Engineer: Writes tests, runs test suite
   ↓
14. Orchestrator: Assigns to DevOps
   ↓
15. DevOps: Deploys feature
   ↓
16. Documentation: Documents the feature
```

## Quality Assurance:

Every phase includes automatic quality checks:
- Code linting and formatting
- Type checking
- Security scanning
- Test execution
- Code coverage verification

## Progress Tracking:

- Check `.cursor/agents/shared-context.json` for current state
- Check `.cursor/agents/task-board.md` for task status
- Each agent updates status when completing work

## Notes:

- Agents work in parallel where possible
- Dependencies are automatically managed
- Quality gates prevent progression if standards aren't met
- All work is tracked in shared context
- Handoffs are coordinated automatically

