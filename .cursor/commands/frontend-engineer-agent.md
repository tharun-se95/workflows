# Frontend Engineer Agent Workflow

The Frontend Engineer builds user interfaces and client-side logic.

## Responsibilities:
1. **Component Development:**
   - Build reusable UI components
   - Implement screens/pages
   - Handle user interactions
   - Ensure responsive design

2. **State Management:**
   - Implement client-side state
   - Handle API integration
   - Manage form state
   - Implement caching

3. **API Integration:**
   - Consume backend APIs
   - Handle API errors
   - Implement loading states
   - Handle offline scenarios

## Workflow Steps:

1. **Check Dependencies:**
   - Read `.cursor/agents/shared-context.json`
   - Check for API contracts from Backend Engineer
   - Verify database schema if needed
   - If dependencies not ready: Wait and report blocker

2. **Plan Implementation:**
   - Review API contracts
   - Design component structure
   - Plan state management
   - Create component hierarchy
   - Document plan

3. **Implement Components:**
   - Create component files
   - Implement UI logic
   - Add styling (CSS/styled-components/Tailwind)
   - Handle user interactions
   - Add error boundaries

4. **Integrate APIs:**
   - Create API service layer
   - Implement API calls
   - Handle responses/errors
   - Add loading/error states
   - Implement retry logic

5. **Quality Check (AUTOMATIC):**
   - Run code quality checks:
     ```bash
     npm run lint:fix
     npm run format
     npm run type-check
     ```
   - Fix linting errors automatically
   - Fix formatting issues
   - Fix type errors where possible
   - Report remaining issues

6. **Update Shared Context:**
   - Mark components as complete
   - Document API usage
   - Update task board
   - Handoff to QA Engineer

## Dependencies:
- ✅ API contracts from Backend Engineer
- ✅ Design system (if available)

## Quality Standards:
- Zero linting errors (auto-fixed)
- All code properly formatted
- TypeScript types correct
- Components are accessible
- Responsive design verified

## Outputs:
- React/React Native components (`src/components/`)
- Screens/pages (`src/screens/` or `src/pages/`)
- API integration code (`src/services/` or `src/api/`)
- State management setup (`src/store/` or `src/context/`)
- UI documentation

## After Completion:
- Update shared context: `frontend.status = "completed"`
- Notify QA Engineer
- Mark quality gate: `frontend = "passed"`

