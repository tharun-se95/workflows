# Project Rules - Multi-Agent Engineering Team

## Team Coordination Rules:

### Agent Responsibilities:
- Each agent must check `.cursor/agents/shared-context.json` before starting work
- Agents must update shared context when completing tasks
- Agents must report blockers immediately
- Agents must follow quality gates

### Quality Enforcement:
- **Automatic Quality Checks:** All agents run quality checks after completing work
- **No Skipping:** Quality gates cannot be bypassed
- **Auto-Fix:** Agents automatically fix issues where possible
- **Report Issues:** Agents report remaining issues that need manual attention

### Dependency Management:
- Agents wait for dependencies before starting
- Agents notify next agent when work is ready
- Orchestrator manages dependencies automatically
- Blockers are reported and resolved quickly

### Communication:
- All communication through shared context
- Task board tracks all work
- Agents update status when working
- Handoffs are documented

## Code Quality Standards:

### Frontend:
- Zero linting errors (auto-fixed)
- All code properly formatted
- TypeScript types correct
- Components are accessible
- Responsive design verified

### Backend:
- Zero linting errors (auto-fixed)
- All code properly formatted
- TypeScript types correct
- Security checks passed
- Error handling implemented
- API documented

### Database:
- Migrations are reversible
- All constraints defined
- Indexes optimized
- Schema documented

### Testing:
- Test coverage >80% for critical paths
- All tests passing
- No flaky tests

## Workflow Rules:

### Development Flow:
1. Architect designs system
2. Database Engineer creates schema
3. Backend Engineer implements APIs
4. Frontend Engineer builds UI
5. QA Engineer writes tests
6. DevOps Engineer deploys

### Quality Gates:
- Architecture must be approved
- Database schema must be approved
- Backend must pass quality checks
- Frontend must pass quality checks
- Tests must pass
- Deployment must succeed

### Conflict Resolution:
- Architect makes final technical decisions
- Orchestrator resolves blockers
- Team discusses in shared context
- Decisions are documented

## File Organization:

### Project Structure:
```
.cursor/
├── agents/
│   ├── team-structure.md
│   ├── coordination-protocol.md
│   ├── communication-protocol.md
│   ├── shared-context.json
│   └── task-board.md
├── commands/
│   ├── architect-agent.md
│   ├── frontend-engineer-agent.md
│   ├── backend-engineer-agent.md
│   ├── database-engineer-agent.md
│   ├── devops-engineer-agent.md
│   ├── qa-engineer-agent.md
│   ├── documentation-agent.md
│   ├── orchestrate-team.md
│   └── build-fullstack-app.md
└── rules/
    └── project-rules.md
```

## Best Practices:

1. **Always check shared context** before starting work
2. **Update shared context** when completing work
3. **Run quality checks** automatically after code changes
4. **Document decisions** in appropriate files
5. **Follow the workflow** - don't skip steps
6. **Report blockers** immediately
7. **Coordinate handoffs** properly
8. **Maintain quality standards** throughout

## Agent-Specific Rules:

### Architect:
- Document all design decisions
- Create clear API contracts
- Design scalable architecture
- Make final technical decisions

### Frontend Engineer:
- Build reusable components
- Follow design system
- Handle all edge cases
- Ensure accessibility

### Backend Engineer:
- Follow API contracts exactly
- Implement proper error handling
- Secure all endpoints
- Document APIs

### Database Engineer:
- Create reversible migrations
- Optimize queries
- Document schema
- Test migrations

### DevOps Engineer:
- Automate everything possible
- Test deployments
- Monitor systems
- Document infrastructure

### QA Engineer:
- Write comprehensive tests
- Test edge cases
- Verify quality standards
- Report issues clearly

### Documentation Agent:
- Keep docs up-to-date
- Write clear documentation
- Document decisions
- Maintain changelog

