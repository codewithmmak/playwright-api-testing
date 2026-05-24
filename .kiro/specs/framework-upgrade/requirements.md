# Requirements Document

## Introduction

This document defines the requirements for upgrading the existing Playwright API test automation framework targeting the Restful Booker API. The current framework consists of 10 flat spec files with raw `request` calls, hardcoded credentials, hardcoded booking IDs, no environment configuration, no fixtures, no schema validation, and no CI/CD pipeline. The upgrade introduces industry-standard patterns: an API client abstraction layer, Playwright fixtures for shared state, environment-driven configuration, JSON schema validation, structured test data factories, ESLint code quality enforcement, Allure reporting, and a GitHub Actions CI/CD pipeline. All existing test coverage is preserved and extended.

---

## Glossary

- **Framework**: The Playwright-based API test automation project targeting the Restful Booker API.
- **API_Client**: The abstraction layer that wraps all HTTP interactions with the Restful Booker API endpoints.
- **Auth_Client**: The component of the API_Client responsible for obtaining and caching authentication tokens.
- **Booking_Client**: The component of the API_Client responsible for all booking CRUD operations.
- **Fixture**: A Playwright test fixture that provides pre-configured, shared objects (e.g., authenticated API client) to tests.
- **Token**: A session token returned by the `/auth` endpoint, used to authorise PUT, PATCH, and DELETE requests.
- **Booking**: A resource on the Restful Booker API representing a hotel reservation, identified by a `bookingId`.
- **bookingId**: The integer identifier returned when a Booking is created, used to address that Booking in subsequent requests.
- **Test_Data_Factory**: A module that generates valid, randomised Booking payloads using `@faker-js/faker` and `luxon`.
- **Schema_Validator**: The component that validates API response bodies against defined JSON schemas.
- **Environment_Config**: The configuration layer that reads runtime values (base URL, credentials) from environment variables or a `.env` file.
- **ESLint**: The static analysis tool enforcing code style and quality rules across the Framework.
- **Allure**: The reporting tool that produces structured, browsable HTML test reports with step-level detail.
- **CI_Pipeline**: The GitHub Actions workflow that executes the test suite on every push and pull request.
- **Test_Suite**: A `test.describe` block grouping related tests for a single API resource or operation.

---

## Requirements

### Requirement 1: API Client Abstraction Layer

**User Story:** As a Senior Automation Architect, I want all HTTP interactions encapsulated in a dedicated API client, so that test files contain zero raw `request` calls and changes to endpoint paths or headers require edits in one place only.

#### Acceptance Criteria

1. THE API_Client SHALL expose dedicated methods for every Restful Booker endpoint: `createBooking`, `getBookings`, `getBooking`, `updateBooking`, `partialUpdateBooking`, `deleteBooking`, and `createToken`.
2. WHEN a test calls an API_Client method, THE API_Client SHALL construct the full request (URL, headers, body) internally without requiring the caller to provide raw path strings or header objects.
3. THE Booking_Client SHALL accept a `bookingId` parameter for all single-resource operations (GET, PUT, PATCH, DELETE) rather than accepting a hardcoded path.
4. THE Auth_Client SHALL expose a `getToken` method that returns a valid Token string.
5. WHEN `getToken` is called and a valid Token already exists in the current test context, THE Auth_Client SHALL return the cached Token without issuing a new `/auth` request.
6. IF the `/auth` endpoint returns a response with status code other than 200, THEN THE Auth_Client SHALL throw a descriptive error identifying the failure.

---

### Requirement 2: Playwright Fixtures for Shared State

**User Story:** As a Senior Automation Architect, I want Playwright fixtures to provide authenticated API clients and freshly created bookings to tests, so that each test receives the state it needs without duplicating setup code.

#### Acceptance Criteria

1. THE Framework SHALL define a custom `apiClient` fixture that instantiates the API_Client and makes it available to every test that declares it.
2. THE Framework SHALL define a custom `authToken` fixture that calls `Auth_Client.getToken` once per test and provides the resulting Token string.
3. THE Framework SHALL define a custom `createdBooking` fixture that creates a new Booking via the API before the test runs, provides the `bookingId` and full booking payload to the test, and deletes the Booking after the test completes.
4. WHEN a test uses the `createdBooking` fixture, THE Framework SHALL use a dynamically generated `bookingId` from the fixture rather than any hardcoded ID.
5. IF the fixture teardown DELETE request fails, THEN THE Framework SHALL log a warning identifying the `bookingId` that could not be cleaned up, without failing the test that used the fixture.

---

### Requirement 3: Environment-Driven Configuration

**User Story:** As a Senior Automation Architect, I want all environment-specific values loaded from environment variables or a `.env` file, so that the framework can target different environments without modifying source files.

#### Acceptance Criteria

1. THE Environment_Config SHALL load `BASE_URL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` from environment variables at runtime.
2. WHERE a `.env` file is present in the project root, THE Environment_Config SHALL load it using `dotenv` before reading environment variables.
3. THE Framework SHALL remove all hardcoded occurrences of `https://restful-booker.herokuapp.com`, `admin`, and `password123` from test files and the Playwright config.
4. THE playwright.config.js SHALL read `baseURL` from `process.env.BASE_URL`, defaulting to `https://restful-booker.herokuapp.com` when the variable is absent.
5. THE Framework SHALL include a `.env.example` file listing all required environment variables with placeholder values and inline comments.
6. IF a required environment variable is absent and no default is defined, THEN THE Environment_Config SHALL throw a descriptive error at startup identifying the missing variable by name.

---

### Requirement 4: Test Data Factory

**User Story:** As a Senior Automation Architect, I want a centralised test data factory that generates valid, randomised booking payloads, so that tests are not coupled to static values and edge cases can be exercised with minimal effort.

#### Acceptance Criteria

1. THE Test_Data_Factory SHALL expose a `createBookingPayload` function that returns a complete, valid Booking object with randomised `firstname`, `lastname`, `totalprice`, `depositpaid`, `checkin`, and `checkout` values.
2. WHEN `createBookingPayload` is called, THE Test_Data_Factory SHALL generate `checkin` and `checkout` dates using `luxon`, with `checkout` always set to a date after `checkin`.
3. THE Test_Data_Factory SHALL accept an optional overrides object, merging caller-supplied fields over the generated defaults.
4. THE Framework SHALL remove the `test-data/booking-details.json` static file and replace all references to it with calls to `Test_Data_Factory.createBookingPayload`.
5. THE Test_Data_Factory SHALL correct the existing date typo (`"2023-061-15"`) by generating all dates programmatically rather than using string literals.

---

### Requirement 5: JSON Schema Validation

**User Story:** As a Senior Automation Architect, I want every API response validated against a JSON schema, so that structural regressions in the API contract are caught automatically without relying solely on property-level assertions.

#### Acceptance Criteria

1. THE Framework SHALL define JSON schemas for the following response shapes: `BookingIdResponse` (POST /booking), `BookingResponse` (GET /booking/:id, PUT, PATCH), `BookingListResponse` (GET /booking), `TokenResponse` (POST /auth), and `DeleteResponse` (DELETE /booking/:id).
2. THE Schema_Validator SHALL validate every API response body against the corresponding schema before any property-level assertions are made.
3. WHEN a response body does not conform to its schema, THE Schema_Validator SHALL fail the test with an error message that identifies the failing field and the violated constraint.
4. THE Framework SHALL use `ajv` (Another JSON Schema Validator) as the schema validation library.
5. THE Schema_Validator SHALL support JSON Schema draft-07.

---

### Requirement 6: Test Structure and Organisation

**User Story:** As a Senior Automation Architect, I want tests grouped into logical suites with descriptive names, so that test reports are readable and failures are immediately locatable.

#### Acceptance Criteria

1. THE Framework SHALL organise test files into subdirectories by HTTP method or resource: `tests/auth/`, `tests/booking/create/`, `tests/booking/read/`, `tests/booking/update/`, `tests/booking/delete/`.
2. EVERY test file SHALL wrap its tests in a `test.describe` block with a name that identifies the operation under test.
3. THE Framework SHALL consolidate the duplicate query-parameter test files (current `06_` and `07_`) into a single file covering both name-based and date-based filter scenarios.
4. THE Framework SHALL remove all `console.log` calls from test files and replace debug output with Playwright's built-in `test.info().annotations` or structured step logging.
5. EVERY test SHALL have a unique, descriptive title that states the expected outcome (e.g., `"should return 200 and a valid booking schema when a booking is created"`).
6. THE Framework SHALL use `test.step` blocks to label the arrange, act, and assert phases within each test.

---

### Requirement 7: ESLint Code Quality Enforcement

**User Story:** As a Senior Automation Architect, I want ESLint configured and enforced across the codebase, so that code style inconsistencies and common JavaScript errors are caught before they reach the repository.

#### Acceptance Criteria

1. THE Framework SHALL include an ESLint configuration file (`.eslintrc.js` or `eslint.config.js`) at the project root.
2. THE ESLint configuration SHALL extend `eslint:recommended` and include the `playwright` ESLint plugin rules.
3. THE ESLint configuration SHALL enforce `no-console` to prevent raw `console.log` calls in test files.
4. THE ESLint configuration SHALL enforce `no-var` to disallow `var` declarations (replace with `const` or `let`).
5. THE Framework SHALL include a `lint` script in `package.json` that runs ESLint across all `.js` files in `tests/` and `src/` (or equivalent source directories).
6. WHEN the `lint` script is executed and ESLint reports errors, THE Framework SHALL exit with a non-zero status code.

---

### Requirement 8: Allure Reporting

**User Story:** As a Senior Automation Architect, I want Allure reports generated after every test run, so that stakeholders can browse test results with step-level detail, history trends, and failure screenshots.

#### Acceptance Criteria

1. THE Framework SHALL install `allure-playwright` and configure it as a reporter in `playwright.config.js` alongside the existing HTML reporter.
2. WHEN tests are executed, THE Allure reporter SHALL write raw result files to an `allure-results/` directory.
3. THE Framework SHALL include an `allure:report` script in `package.json` that generates the browsable HTML report from `allure-results/` into `allure-report/`.
4. THE Framework SHALL include an `allure:open` script in `package.json` that opens the generated report in the default browser.
5. THE `allure-results/` and `allure-report/` directories SHALL be listed in `.gitignore`.
6. WHERE `test.step` blocks are used in tests, THE Allure reporter SHALL capture each step as a named entry in the report.

---

### Requirement 9: GitHub Actions CI/CD Pipeline

**User Story:** As a Senior Automation Architect, I want a GitHub Actions workflow that runs the full test suite on every push and pull request, so that regressions are detected automatically before code is merged.

#### Acceptance Criteria

1. THE CI_Pipeline SHALL be defined in `.github/workflows/playwright.yml` and trigger on `push` and `pull_request` events targeting the `main` branch.
2. WHEN the CI_Pipeline is triggered, THE CI_Pipeline SHALL install Node.js dependencies, install Playwright browsers, run ESLint, and execute the full test suite in sequence.
3. THE CI_Pipeline SHALL pass `BASE_URL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` to the test run via GitHub Actions secrets mapped to environment variables.
4. WHEN the test run completes, THE CI_Pipeline SHALL upload the `allure-results/` directory as a build artifact retained for 30 days.
5. IF any step in the CI_Pipeline fails, THEN THE CI_Pipeline SHALL mark the workflow run as failed and prevent subsequent steps from executing.
6. THE CI_Pipeline SHALL run on `ubuntu-latest` and use Node.js version 20.

---

### Requirement 10: Dependency and Configuration Hygiene

**User Story:** As a Senior Automation Architect, I want the project dependencies and configuration files cleaned up and aligned with the upgraded framework, so that the project is maintainable and free of unused or misconfigured items.

#### Acceptance Criteria

1. THE Framework SHALL move `@faker-js/faker` and `luxon` from `devDependencies` to `dependencies` in `package.json`, as they are runtime test-data dependencies.
2. THE Framework SHALL add `dotenv`, `ajv`, and `allure-playwright` as dependencies in `package.json` with pinned versions.
3. THE playwright.config.js SHALL remove the `projects` array entry for `chromium` browser context, as API tests do not require a browser, and replace it with a single project using `@playwright/test`'s API testing mode.
4. THE playwright.config.js SHALL set `fullyParallel: false` for the default local run configuration to prevent race conditions caused by shared booking IDs during the transition period.
5. THE Framework SHALL include a `test:ci` script in `package.json` that runs tests with `--reporter=allure-playwright` and exits cleanly for use in the CI_Pipeline.
6. THE `package.json` `description` field SHALL be updated to accurately describe the upgraded framework.
