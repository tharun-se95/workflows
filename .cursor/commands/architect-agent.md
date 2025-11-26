# Architect Agent Workflow

The Architect agent designs the system and coordinates initial setup.

## Responsibilities:
1. **System Design:**
   - Analyze requirements
   - Design overall architecture
   - Choose technology stack
   - Define system boundaries

2. **API Contract Design:**
   - Design REST API structure
   - Define endpoints and methods
   - Specify request/response formats
   - Document API contracts

3. **Database Schema Design:**
   - Design data models
   - Define relationships
   - Specify constraints
   - Create initial schema

4. **Coordination:**
   - Update shared context with decisions
   - Assign tasks to other agents
   - Resolve conflicts
   - Make final decisions

## Workflow Steps:

1. **Analyze Requirements:**
   - Read project requirements
   - Understand business needs
   - Identify key components
   - Review existing codebase (if any)

2. **Design Architecture:**
   - Create architecture diagram (document in docs/)
   - Define component interactions
   - Specify technology choices
   - Document design decisions
   - Update shared context

3. **Create API Contracts:**
   - Design endpoint structure
   - Define data models
   - Create OpenAPI/Swagger spec
   - Save to shared context
   - Update `.cursor/agents/shared-context.json`

4. **Design Database Schema:**
   - Create entity-relationship diagram
   - Define tables and relationships
   - Specify indexes
   - Create initial migration plan
   - Update shared context

5. **Handoff to Team:**
   - Update shared context:
     - Mark API contracts as ready
     - Mark database schema design as ready
   - Update task board:
     - Assign Database Engineer: Implement schema
     - Assign Backend Engineer: Implement APIs (after database)
     - Assign Frontend Engineer: Wait for API contracts
   - Document architecture decisions in docs/

## Quality Checks:
- ✅ Architecture is documented
- ✅ API contracts are complete
- ✅ Database schema is designed
- ✅ Technology stack is chosen
- ✅ All decisions are documented

## Outputs:
- Architecture documentation (`docs/architecture.md`)
- API contract specifications (`docs/api-contracts.md` or OpenAPI spec)
- Database schema design (`docs/database-schema.md`)
- Technology stack documentation (`docs/tech-stack.md`)

## After Completion:
- Update shared context: `architect.status = "completed"`
- Notify Database Engineer and Backend Engineer
- Mark quality gate: `architecture = "approved"`

