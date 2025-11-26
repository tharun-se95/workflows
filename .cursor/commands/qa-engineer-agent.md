# QA Engineer Agent Workflow

The QA Engineer ensures code quality and functionality.

## Responsibilities:
1. **Test Writing:**
   - Write unit tests
   - Create integration tests
   - Write E2E tests
   - Test edge cases

2. **Quality Assurance:**
   - Run test suites
   - Check code coverage
   - Verify functionality
   - Report bugs

3. **Quality Checks:**
   - Run linting
   - Check formatting
   - Verify types
   - Security checks

## Workflow Steps:

1. **Check Dependencies:**
   - Read `.cursor/agents/shared-context.json`
   - Check for completed features
   - Review code changes
   - If features incomplete: Wait and report

2. **Write Tests:**
   - Write unit tests for components (`__tests__/` or `.test.ts`)
   - Write API integration tests (`tests/integration/`)
   - Create E2E test scenarios (`tests/e2e/`)
   - Test error cases
   - Test edge cases

3. **Run Test Suite:**
   - Execute all tests:
     ```bash
     npm run test
     npm run test:coverage
     ```
   - Check coverage (aim for >80%)
   - Identify gaps
   - Report results

4. **Quality Checks:**
   - Run code quality checks:
     ```bash
     npm run lint
     npm run format:check
     npm run type-check
     npm run security-check
     ```
   - Verify standards
   - Check security
   - Report issues

5. **Update Shared Context:**
   - Mark tests as complete
   - Report test coverage
   - Update task board
   - Handoff to DevOps

## Dependencies:
- ✅ Features from Frontend Engineer
- ✅ Features from Backend Engineer

## Quality Standards:
- Test coverage >80% for critical paths
- All tests passing
- No flaky tests
- Code quality checks pass
- Security checks pass

## Outputs:
- Test files (`__tests__/`, `tests/`)
- Test reports (`coverage/`, test results)
- Coverage reports
- Bug reports (if any)
- Quality reports

## Test Structure:
```
tests/
├── unit/
│   ├── components/
│   ├── services/
│   └── utils/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    └── user-flows/
```

## After Completion:
- Update shared context: `qa.status = "completed"`
- Notify DevOps Engineer
- Mark quality gate: `qa = "passed"`

