# Playwright API Testing Framework

A production-style API testing framework using Playwright Test and JavaScript.

## Highlights

- Isolated test data lifecycle for create/read/update/delete scenarios
- Environment-driven auth and base URL configuration
- Stronger response contract assertions
- Positive and negative API coverage
- Lint and formatting quality gates
- GitHub Actions CI workflow with report artifacts

## Tech Stack

- Node.js 20+
- Playwright Test
- Faker for dynamic payloads
- ESLint + Prettier

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file from the sample:

```bash
cp .env.example .env
```

3. Set valid values in `.env`:

- `BASE_URL`
- `BOOKER_USERNAME`
- `BOOKER_PASSWORD`

## Run Commands

- Run full test suite: `npm test`
- Run against dev profile: `npm run test:dev`
- Run against qa profile: `npm run test:qa`
- Run against staging profile: `npm run test:staging`
- Run against prod profile: `npm run test:prod`
- Run with headed mode: `npm run test:headed`
- Open last HTML report: `npm run test:report`
- CI-style run with line/junit/html reports: `npm run test:ci`
- Lint checks: `npm run lint`
- Fix lint issues: `npm run lint:fix`
- Format checks: `npm run format`
- Apply formatting: `npm run format:write`
- Install local git hooks: `npm run hooks:install`

## Environment Profiles

The framework supports profile-based execution using `TEST_ENV`:

- `dev` -> `.env.dev`
- `qa` -> `.env.qa`
- `staging` -> `.env.staging`
- `prod` -> `.env.prod`
- default fallback -> `.env`

Sample templates are provided:

- `.env.dev.example`
- `.env.qa.example`
- `.env.staging.example`
- `.env.prod.example`

Create local env files by copying examples and replacing placeholders.

## Project Structure

```text
tests/
	support/
		booking-api.js        # Shared helpers for auth and booking API actions
	*.spec.js               # API test scenarios
test-data/
	booking-details.json    # Static payload sample
playwright.config.js      # Test runner and reporting config
```

## Test Design Standards

- Tests must not depend on hardcoded booking IDs.
- Mutation tests (PUT/PATCH/DELETE) create their own booking first.
- Auth credentials are loaded from environment variables only.
- Tokens are not logged.
- Assertions include status + schema/contract + relevant business behavior.

## CI

GitHub Actions workflow: `.github/workflows/api-tests.yml`

It performs:

- dependency install
- browser install
- lint check
- format check
- API tests in matrix: dev, qa, staging, prod
- artifact upload for HTML and JUnit reports

For each GitHub Environment (`dev`, `qa`, `staging`, `prod`), configure:

- `BASE_URL` as an Environment Variable
- `BOOKER_USERNAME`
- `BOOKER_PASSWORD`

## Framework Standardization Files

- Steering: `.github/copilot-instructions.md`
- Skill: `.github/skills/api-framework/SKILL.md`
- Agent: `.github/agents/api-test-maintainer.agent.md`
- Hook: `.githooks/pre-commit`

## Useful Notes

- Default `BASE_URL` fallback is `https://restful-booker.herokuapp.com`.
- HTML report is generated under `playwright-report/`.
- JUnit report is generated under `test-results/junit-report.xml`.
