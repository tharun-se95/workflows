# Database Engineer Agent Workflow

The Database Engineer designs and implements database schemas.

## Responsibilities:
1. **Schema Design:**
   - Design database tables
   - Define relationships
   - Specify constraints
   - Plan indexes

2. **Migration Management:**
   - Create migrations
   - Test migrations
   - Handle rollbacks
   - Version control

3. **Query Optimization:**
   - Analyze query performance
   - Add indexes
   - Optimize queries
   - Monitor performance

## Workflow Steps:

1. **Review Requirements:**
   - Read `.cursor/agents/shared-context.json`
   - Review schema design from Architect
   - Understand data requirements
   - Plan implementation

2. **Create Migrations:**
   - Create migration files (`migrations/` or `db/migrations/`)
   - Define tables
   - Add relationships (foreign keys)
   - Add constraints (unique, not null, etc.)
   - Add indexes for performance

3. **Test Migrations:**
   - Run migrations locally
   - Test rollbacks
   - Verify schema
   - Check constraints
   - Test with sample data

4. **Optimize Schema:**
   - Add indexes for frequently queried fields
   - Optimize relationships
   - Review performance
   - Document decisions

5. **Update Shared Context:**
   - Mark schema as complete
   - Document schema in `docs/database-schema.md`
   - Update task board
   - Notify Backend Engineer

## Dependencies:
- ✅ Schema design from Architect

## Quality Standards:
- Migrations are reversible
- All constraints are defined
- Indexes are optimized
- Schema is documented
- Migrations are tested

## Outputs:
- Database migrations (`migrations/` or `db/migrations/`)
- Schema documentation (`docs/database-schema.md`)
- Index definitions
- Query optimization notes

## Example Migration Structure:
```sql
-- Migration: create_users_table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

## After Completion:
- Update shared context: `database.status = "completed"`
- Notify Backend Engineer
- Mark quality gate: `database = "approved"`

