# Multi-Agent Engineering Team System

A coordinated team of AI agents working together to build full-stack applications.

## 🏗️ Team Structure

The engineering team consists of 7 specialized agents:

1. **Architect Agent** 🏗️ - System design and architecture
2. **Frontend Engineer Agent** 🎨 - UI/UX implementation
3. **Backend Engineer Agent** 🔧 - Server-side logic and APIs
4. **Database Engineer Agent** 💾 - Database design and optimization
5. **DevOps Engineer Agent** 🚀 - Infrastructure and deployment
6. **QA Engineer Agent** ✅ - Testing and quality assurance
7. **Documentation Agent** 📚 - Documentation and knowledge management

## 🚀 Quick Start

### Build a Full-Stack Application

To build an entire application with the team:

```
/build-fullstack-app
```

### Orchestrate the Team

To coordinate the team on a specific task:

```
/orchestrate-team
```

### Use Individual Agents

To use a specific agent:

```
/architect-agent          # Design system architecture
/frontend-engineer-agent  # Build UI components
/backend-engineer-agent    # Implement APIs
/database-engineer-agent   # Create database schemas
/devops-engineer-agent    # Setup CI/CD and deploy
/qa-engineer-agent        # Write tests and QA
/documentation-agent      # Maintain documentation
```

## 📋 How It Works

### 1. Coordination System

The team coordinates through:
- **Shared Context** (`.cursor/agents/shared-context.json`) - Current project state
- **Task Board** (`.cursor/agents/task-board.md`) - Active tasks and status
- **Coordination Protocol** - How agents communicate

### 2. Workflow Pattern

```
Architect → Database Engineer → Backend Engineer
                ↓
         Frontend Engineer
                ↓
         QA Engineer → DevOps Engineer
                ↓
         Documentation Agent
```

### 3. Quality Gates

Every agent automatically runs quality checks:
- Code linting and formatting
- Type checking
- Security scanning
- Test execution

Quality gates must pass before proceeding to the next phase.

## 📁 File Structure

```
.cursor/
├── agents/
│   ├── team-structure.md          # Team member definitions
│   ├── coordination-protocol.md   # How agents coordinate
│   ├── communication-protocol.md  # Communication standards
│   ├── shared-context.json        # Current project state
│   └── task-board.md              # Task tracking
├── commands/
│   ├── architect-agent.md         # Architect workflow
│   ├── frontend-engineer-agent.md # Frontend workflow
│   ├── backend-engineer-agent.md  # Backend workflow
│   ├── database-engineer-agent.md # Database workflow
│   ├── devops-engineer-agent.md   # DevOps workflow
│   ├── qa-engineer-agent.md       # QA workflow
│   ├── documentation-agent.md     # Documentation workflow
│   ├── orchestrate-team.md        # Team orchestrator
│   └── build-fullstack-app.md     # Master workflow
└── rules/
    └── project-rules.md           # Project standards
```

## 🔄 Example Workflow

### Building User Authentication Feature

1. **You:** "Build user authentication feature"
2. **Orchestrator:** Assigns to Architect
3. **Architect:** Designs auth flow, creates API contract
4. **Orchestrator:** Assigns to Database Engineer
5. **Database Engineer:** Creates user table migration
6. **Orchestrator:** Assigns to Backend Engineer
7. **Backend Engineer:** Implements auth API
8. **Backend Engineer:** Runs quality checks (AUTOMATIC)
9. **Orchestrator:** Assigns to Frontend Engineer
10. **Frontend Engineer:** Builds login/signup UI
11. **Frontend Engineer:** Runs quality checks (AUTOMATIC)
12. **Orchestrator:** Assigns to QA Engineer
13. **QA Engineer:** Writes tests, runs test suite
14. **Orchestrator:** Assigns to DevOps
15. **DevOps:** Deploys feature
16. **Documentation:** Documents the feature

## ✨ Key Features

### Automatic Quality Checks
- All agents automatically run quality checks after completing work
- Issues are auto-fixed where possible
- Remaining issues are reported for manual attention

### Dependency Management
- Agents automatically wait for dependencies
- Orchestrator manages task assignment
- Blockers are reported and resolved

### Quality Gates
- Architecture must be approved
- Database schema must be approved
- Code must pass quality checks
- Tests must pass
- Deployment must succeed

### Coordination
- Shared context tracks project state
- Task board tracks all work
- Agents communicate through protocols
- Handoffs are coordinated automatically

## 📖 Documentation

- **Team Structure:** `.cursor/agents/team-structure.md`
- **Coordination:** `.cursor/agents/coordination-protocol.md`
- **Communication:** `.cursor/agents/communication-protocol.md`
- **Project Rules:** `.cursor/rules/project-rules.md`

## 🎯 Best Practices

1. Always check shared context before starting work
2. Update shared context when completing tasks
3. Run quality checks automatically
4. Follow the workflow - don't skip steps
5. Report blockers immediately
6. Coordinate handoffs properly
7. Maintain quality standards

## 🔍 Monitoring Progress

- Check `.cursor/agents/shared-context.json` for current state
- Check `.cursor/agents/task-board.md` for task status
- Each agent updates status when completing work

## 🛠️ Customization

You can customize:
- Agent responsibilities in `team-structure.md`
- Workflow patterns in individual agent files
- Quality standards in `project-rules.md`
- Coordination protocols in `coordination-protocol.md`

---

**Ready to build?** Start with `/build-fullstack-app` or `/orchestrate-team`!

