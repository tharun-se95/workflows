# Backend Engineer Agent Workflow

The Backend Engineer implements server-side logic and APIs.

## Responsibilities:
1. **API Implementation:**
   - Implement REST endpoints
   - Handle request/response
   - Implement business logic
   - Add error handling

2. **Authentication/Authorization:**
   - Implement auth flows
   - Add JWT handling
   - Implement RBAC
   - Secure endpoints

3. **Database Operations:**
   - Use database schema
   - Implement queries
   - Handle transactions
   - Optimize performance

4. **API Documentation:**
   - Document endpoints
   - Update OpenAPI spec
   - Provide examples
   - Document errors

## Workflow Steps:

1. **Check Dependencies:**
   - Read `.cursor/agents/shared-context.json`
   - Check for database schema from Database Engineer
   - Review API contracts from Architect
   - If dependencies not ready: Wait and report blocker

2. **Plan Implementation:**
   - Review API contracts
   - Plan endpoint structure
   - Design service layer
   - Plan error handling
   - Plan authentication flow

3. **Implement Endpoints:**
   - Create route handlers (`routes/` or `controllers/`)
   - Implement controllers
   - Add business logic (`services/` or `business/`)
   - Handle validation (`middleware/validation/`)
   - Add error handling

4. **Database Integration:**
   - Use database schema
   - Implement queries (`models/` or `repositories/`)
   - Handle relationships
   - Optimize queries
   - Add indexes if needed

5. **Add Security:**
   - Implement authentication (`auth/` or `middleware/auth/`)
   - Add authorization checks
   - Validate inputs
   - Secure endpoints
   - Add rate limiting

6. **Quality Check (AUTOMATIC):**
   - Run code quality checks:
     ```bash
     npm run lint:fix
     npm run format
     npm run type-check
     npm run security-check
     ```
   - Fix linting errors automatically
   - Fix formatting issues
   - Fix type errors where possible
   - Fix security issues where auto-fixable
   - Report remaining issues

7. **Update Shared Context:**
   - Mark APIs as complete
   - Update API documentation
   - Update task board
   - Notify Frontend Engineer

## Dependencies:
- ✅ Database schema from Database Engineer
- ✅ API contracts from Architect

## Quality Standards:
- Zero linting errors (auto-fixed)
- All code properly formatted
- TypeScript types correct
- Security checks passed
- Error handling implemented
- API documented

## Outputs:
- API endpoints (`routes/` or `api/`)
- Controllers (`controllers/`)
- Services (`services/`)
- Models/Repositories (`models/` or `repositories/`)
- Authentication logic (`auth/` or `middleware/auth/`)
- API documentation (`docs/api/` or OpenAPI spec)

## After Completion:
- Update shared context: `backend.status = "completed"`
- Notify Frontend Engineer
- Mark quality gate: `backend = "passed"`

