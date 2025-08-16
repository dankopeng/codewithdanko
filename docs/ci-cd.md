# CI/CD Workflows

CodeWithDanko uses GitHub Actions for continuous integration and deployment. This document explains the available workflows and how to use them.

## Available Workflows

### 1. Continuous Integration (CI)

**File:** `.github/workflows/ci.yml`

This workflow runs automatically on every push to the `main` branch and on pull requests targeting `main`.

**Jobs:**
- **Lint:** Runs ESLint to check code quality
- **TypeScript Check:** Verifies TypeScript types
- **Test:** Runs all tests
- **Build:** Builds the application and uploads artifacts

**Usage:**
No manual action required. The workflow runs automatically when code is pushed or a pull request is created.

### 2. Deployment

**File:** `.github/workflows/deploy.yml`

This workflow deploys the application to Cloudflare Workers.

**Triggers:**
- Push to `main` branch (automatic deployment)
- Manual trigger via GitHub Actions UI

**Environment Options:**
- Production (default)
- Staging

**Jobs:**
1. Builds the application
2. Applies database migrations
3. Deploys the API Worker
4. Deploys the Web Worker
5. Comments on the PR with deployment URLs (if triggered from a PR)

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Workers access
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

**Manual Deployment:**
1. Go to the "Actions" tab in your GitHub repository
2. Select the "Deploy" workflow
3. Click "Run workflow"
4. Select the environment (production or staging)
5. Click "Run workflow"

### 3. Pull Request Tests

**File:** `.github/workflows/pr-test.yml`

This workflow runs tests on pull requests to ensure code quality before merging.

**Jobs:**
- Lint
- TypeScript Check
- Tests
- Build

After completion, it adds a comment to the PR with the test results summary.

## Setting Up Secrets

To use these workflows, you need to set up the following secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add the following secrets:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## Creating a Cloudflare API Token

1. Log in to your Cloudflare dashboard
2. Go to "My Profile" > "API Tokens"
3. Click "Create Token"
4. Select "Edit Cloudflare Workers" template
5. Set the permissions:
   - Account > Workers Scripts > Edit
   - Account > Workers Routes > Edit
   - Account > D1 > Edit
   - Account > R2 > Edit
6. Set the resources to include your account
7. Create the token and copy it
8. Add it as a secret in your GitHub repository

## Customizing Workflows

You can customize these workflows by editing the YAML files in the `.github/workflows/` directory:

- Modify the `ci.yml` file to add or remove checks
- Update the `deploy.yml` file to change deployment settings
- Adjust the `pr-test.yml` file to modify PR test requirements

## Troubleshooting

### Common Issues

1. **Deployment Failures:**
   - Check that your Cloudflare API token has the correct permissions
   - Verify that your wrangler configuration files are correct
   - Look for errors in the GitHub Actions logs

2. **Test Failures:**
   - Check the detailed logs in the GitHub Actions UI
   - Run the tests locally to debug: `npm test`

3. **Build Failures:**
   - Check for TypeScript errors: `npm run typecheck`
   - Verify dependencies are installed correctly

### Getting Help

If you encounter issues with the CI/CD workflows:

1. Check the detailed logs in the GitHub Actions UI
2. Review the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
3. Open an issue in the repository with details about the problem
