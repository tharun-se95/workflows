# Documentation Agent Workflow

The Documentation Agent maintains all project documentation.

## Responsibilities:
1. **Code Documentation:**
   - Add JSDoc comments
   - Document complex algorithms
   - Explain design decisions
   - Keep comments updated

2. **API Documentation:**
   - Document endpoints
   - Create request/response examples
   - Document error responses
   - Keep OpenAPI specs updated

3. **User Documentation:**
   - Write user guides
   - Create setup instructions
   - Document features
   - Keep README updated

4. **Architecture Documentation:**
   - Document system architecture
   - Update diagrams
   - Document decisions
   - Maintain changelog

## Workflow Steps:

1. **Monitor Changes:**
   - Read `.cursor/agents/shared-context.json`
   - Monitor code changes
   - Track feature additions
   - Identify documentation needs

2. **Update Code Documentation:**
   - Add JSDoc to new functions
   - Update existing comments
   - Document complex logic
   - Explain non-obvious code

3. **Update API Documentation:**
   - Document new endpoints
   - Update request/response examples
   - Document error codes
   - Update OpenAPI/Swagger spec

4. **Update User Documentation:**
   - Update README.md
   - Create/update user guides
   - Document new features
   - Add setup instructions

5. **Update Architecture Docs:**
   - Document architecture decisions
   - Update system diagrams
   - Document data flows
   - Maintain changelog

## Continuous Work:
- Works throughout the project
- Updates docs as code changes
- Maintains consistency
- Ensures completeness

## Quality Standards:
- All APIs are documented
- Code has appropriate comments
- README is up-to-date
- User guides are clear
- Architecture is documented

## Outputs:
- API documentation (`docs/api/` or OpenAPI spec)
- Code comments (in source files)
- README.md
- User guides (`docs/user-guide.md`)
- Architecture docs (`docs/architecture.md`)
- Changelog (`CHANGELOG.md`)

## Documentation Structure:
```
docs/
├── architecture.md
├── api/
│   └── endpoints.md
├── database/
│   └── schema.md
├── user-guide.md
└── development.md
```

## After Updates:
- Update shared context: `documentation.lastUpdate = timestamp`
- Notify team of major documentation updates

