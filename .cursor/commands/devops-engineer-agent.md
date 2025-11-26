# DevOps Engineer Agent Workflow

The DevOps Engineer handles infrastructure and deployment.

## Responsibilities:
1. **CI/CD Setup:**
   - Configure CI pipelines
   - Setup automated testing
   - Configure deployment
   - Handle secrets

2. **Infrastructure:**
   - Setup environments
   - Configure services
   - Setup monitoring
   - Handle scaling

3. **Deployment:**
   - Build applications
   - Deploy to environments
   - Handle rollbacks
   - Monitor deployments

## Workflow Steps:

1. **Early Setup:**
   - Setup CI/CD structure (`.github/workflows/` or `.gitlab-ci.yml`)
   - Configure basic pipelines
   - Setup environments (dev, staging, prod)
   - Prepare deployment configs
   - Setup environment variables

2. **Continuous Integration:**
   - Add test steps to CI
   - Add build steps
   - Add quality checks (linting, formatting)
   - Configure notifications
   - Add artifact storage

3. **Deployment Configuration:**
   - Configure production environment
   - Setup staging environment
   - Configure secrets management
   - Setup monitoring (logs, metrics, alerts)
   - Configure auto-scaling

4. **Deploy Application:**
   - Build application (mobile + backend)
   - Run tests
   - Deploy to staging
   - Run smoke tests
   - Deploy to production
   - Verify deployment

5. **Monitor & Maintain:**
   - Monitor deployments
   - Handle issues
   - Update infrastructure
   - Document processes
   - Review and optimize

## Dependencies:
- ✅ Code from Frontend Engineer
- ✅ Code from Backend Engineer
- ✅ Database migrations

## Quality Standards:
- CI pipeline passes all tests
- Builds are reproducible
- Deployments are automated
- Monitoring is configured
- Rollback procedures are tested

## Outputs:
- CI/CD configurations (`.github/workflows/`, `.gitlab-ci.yml`, etc.)
- Deployment scripts (`scripts/deploy.sh`)
- Infrastructure configs (`docker-compose.yml`, `kubernetes/`, etc.)
- Monitoring setup (logging, metrics, alerts)
- Environment configuration

## Example CI Pipeline:
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## After Completion:
- Update shared context: `devops.status = "completed"`
- Mark quality gate: `deployment = "successful"`

