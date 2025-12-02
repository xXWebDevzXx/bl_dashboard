# CI/CD Pipeline Setup

## Overview

This project uses **GitHub Actions** for continuous integration. The CI pipeline automatically runs on:

- Every push to the `main` branch
- Every pull request targeting the `main` branch

## What the CI Pipeline Does

The pipeline (`.github/workflows/ci.yml`) performs the following checks:

1. **Install Dependencies** - Installs all npm packages
2. **Linting** - Runs ESLint to check code quality
3. **Type Checking** - Validates TypeScript types across the codebase
4. **Prisma Validation** - Ensures database schema is valid
5. **Prisma Generation** - Generates Prisma client
6. **Build** - Builds the Next.js application

## Local Testing

Before pushing code, you can run these checks locally:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Type check
npx tsc --noEmit

# Validate Prisma
npx prisma validate

# Generate Prisma client
npx prisma generate

# Build the application
npm run build
```

## Environment Variables

If your build requires environment variables, you'll need to add them as GitHub Secrets:

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add any required secrets (e.g., `AUTH0_SECRET`, `DATABASE_URL`, etc.)

Then update `.github/workflows/ci.yml` to include them in the `env:` section.

## Viewing CI Results

- After pushing to GitHub, go to the **Actions** tab in your repository
- Click on the latest workflow run to see detailed logs
- Green checkmark ✅ = All checks passed
- Red X ❌ = Some checks failed (click for details)

## Adding More Checks

You can extend the CI pipeline by adding more steps to `.github/workflows/ci.yml`:

### Add Tests (if you add a test framework):

```yaml
- name: Run tests
  run: npm test
```

### Add Database Migrations Check:

```yaml
- name: Check for pending migrations
  run: npx prisma migrate status
```

### Add Security Audit:

```yaml
- name: Security audit
  run: npm audit --audit-level=moderate
```

## Troubleshooting

**Build fails due to missing environment variables:**

- Add them as GitHub Secrets or add `SKIP_ENV_VALIDATION: true` to the build step

**Type errors in CI but not locally:**

- Make sure your local Node/TypeScript versions match CI (Node 20)
- Run `npm ci` locally to ensure consistent dependencies

**Prisma issues:**

- Ensure `prisma/schema.prisma` is committed to git
- Check that `@prisma/client` version matches `prisma` dev dependency
