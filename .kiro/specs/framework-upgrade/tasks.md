# Implementation Plan: Framework Upgrade

## Overview

Incrementally upgrade the existing 10-file flat Playwright API test suite into a layered, production-grade framework. Each task builds on the previous, ending with full wiring of all components. The implementation language is JavaScript (CommonJS, matching the existing codebase).

## Tasks

- [-] 1. Install dependencies and scaffold directory structure
  - Add `dotenv`, `ajv`, `ajv-formats`, `fast-check`, and `allure-playwright` as pinned dependencies in `package.json`
  - Move `@faker-js/faker` and `luxon` from `devDependencies` to `dependencies`
  - Create the directory tree: `src/api/`, `src/config/`, `src/data/`, `src/schemas/`, `fixtures/`, `tests/auth/`, `tests/booking/create/`, `tests/booking/read/`, `tests/booking/update/`, `tests/booking/delete/`, `tests/unit/`, `.github/workflows/`
  - Add `lint`, `allure:report`, `allure:open`, and `test:ci` scripts to `package.json`
  - Update the `description` field in `package.json`
  - _Requirements: 10.1, 10.2, 10.5, 10.6_

- [ ] 2. Implement environment configuration
  - [~] 2.1 Create `src/config/environment.js`
    - Load `.env` via `dotenv` before reading `process.env`
    - Export `baseUrl` (defaulting to `https://restful-booker.herokuapp.com`), `adminUsername`, and `adminPassword`
    - Throw `Error('Missing required environment variable: <NAME>')` for absent required variables
    - _Requirements: 3.1, 3.2, 3.6_

  - [~] 2.2 Write property tests for environment config
    - **Property 3: Environment config round-trip** — for any valid string values set as env vars, the module returns those exact values
    - **Property 4: Missing required env var produces named error** — removing a required var causes a throw whose message contains the var name
    - **Validates: Requirements 3.1, 3.6**
    - Test file: `tests/unit/environment.property.js`

  - [~] 2.3 Create `.env.example`
    - List `BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` with placeholder values and inline comments
    - _Requirements: 3.5_

- [ ] 3. Implement the API client layer
  - [~] 3.1 Create `src/api/AuthClient.js`
    - Accept `request` (Playwright `APIRequestContext`) and `config` in constructor
    - Implement `getToken()`: return cached `this._token` if set, otherwise POST to `/auth` with credentials from config, cache and return the token string
    - Throw `Error('Authentication failed: <status> - <body>')` on non-200 response
    - _Requirements: 1.4, 1.5, 1.6_

  - [~] 3.2 Write property test for token caching
    - **Property 2: Auth token caching — single request for multiple calls** — multiple `getToken()` calls on the same instance issue exactly one HTTP request and return the same string
    - **Validates: Requirements 1.5**
    - Test file: `tests/unit/authClient.property.js`

  - [~] 3.3 Create `src/api/BookingClient.js`
    - Accept `request` and `config` in constructor
    - Implement `createBooking(payload)`, `getBookings(filters?)`, `getBooking(bookingId)`, `updateBooking(bookingId, payload, token)`, `partialUpdateBooking(bookingId, payload, token)`, `deleteBooking(bookingId, token)`
    - Set `Content-Type: application/json` and `Accept: application/json` on all requests internally
    - Construct URLs as `${config.baseUrl}/booking` and `${config.baseUrl}/booking/${bookingId}`
    - _Requirements: 1.1, 1.2, 1.3_

  - [~] 3.4 Write property test for URL construction
    - **Property 1: Booking client constructs correct URL for single-resource operations** — for any valid integer `bookingId`, the constructed request URL contains `/booking/<bookingId>`
    - **Validates: Requirements 1.3**
    - Test file: `tests/unit/bookingClient.property.js`

  - [~] 3.5 Create `src/api/ApiClient.js`
    - Accept `request` and `config` in constructor; instantiate `AuthClient` and `BookingClient` internally
    - Expose `createToken()`, `getToken()` delegating to `AuthClient`
    - Expose `createBooking`, `getBookings`, `getBooking`, `updateBooking`, `partialUpdateBooking`, `deleteBooking` delegating to `BookingClient`
    - `updateBooking`, `partialUpdateBooking`, and `deleteBooking` must call `this.authClient.getToken()` internally before forwarding to `BookingClient`
    - _Requirements: 1.1, 1.2_

- [~] 4. Checkpoint — Ensure all unit tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement the test data factory
  - [~] 5.1 Create `src/data/bookingFactory.js`
    - Implement `createBookingPayload(overrides = {})` using `@faker-js/faker` for `firstname`, `lastname`, `totalprice` (integer 50–1000), `depositpaid` (boolean), and `additionalneeds`
    - Generate `checkin` as today's date and `checkout` as today + 1–14 days using `luxon`, formatted as `YYYY-MM-DD`
    - Deep-merge `overrides` over generated defaults (handle nested `bookingdates`)
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [~] 5.2 Write property tests for booking factory
    - **Property 5: Generated booking payload is structurally valid** — every call returns an object with all six required fields and correct types
    - **Property 6: Generated checkout is always after checkin** — `checkout` date is strictly after `checkin` date
    - **Property 7: Override fields are preserved in generated payload** — every field in the overrides object appears unchanged in the result
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Test file: `tests/unit/bookingFactory.property.js`

- [ ] 6. Implement JSON schema validation
  - [~] 6.1 Create JSON schema files in `src/schemas/`
    - Write `bookingIdResponse.json` (POST /booking response with `bookingid` + nested `booking`)
    - Write `bookingResponse.json` (GET /booking/:id, PUT, PATCH response — the booking object at root)
    - Write `bookingListResponse.json` (GET /booking — array of `{ bookingid }`)
    - Write `tokenResponse.json` (POST /auth — `{ token: string }`)
    - Write `deleteResponse.json` (DELETE /booking/:id — string `"Created"`)
    - All schemas use `$schema: "http://json-schema.org/draft-07/schema#"`
    - _Requirements: 5.1, 5.5_

  - [~] 6.2 Create `src/schemas/validator.js`
    - Initialise `ajv` with `ajv-formats` for `date` format support; compile schemas once at module load
    - Export `validate(schemaName, data)` that throws `SchemaValidationError` on failure
    - Error message format: `Schema validation failed for '<schemaName>': <ajv error path> <ajv error message>`
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [~] 6.3 Write property tests for schema validator
    - **Property 8: Schema validator correctly classifies valid and invalid responses** — valid data does not throw; invalid data throws with the offending field path in the message
    - **Validates: Requirements 5.2, 5.3**
    - Test file: `tests/unit/validator.property.js`

- [~] 7. Create Playwright fixtures
  - Create `fixtures/index.js` using `base.extend`
  - Implement `apiClient` fixture: instantiate `ApiClient` with `request` and loaded config, call `use(client)`
  - Implement `authToken` fixture: call `apiClient.getToken()` once, call `use(token)`
  - Implement `createdBooking` fixture: call `createBookingPayload()`, create booking via `apiClient.createBooking()`, call `use({ bookingId, payload })`; in teardown wrap `apiClient.deleteBooking()` in try/catch and emit `console.warn` on failure
  - Export `{ test, expect }` from `fixtures/index.js`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [~] 8. Checkpoint — Ensure all unit and fixture tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Migrate and rewrite integration tests
  - [~] 9.1 Create `tests/auth/createToken.spec.js`
    - Import `{ test, expect }` from `fixtures/index.js`
    - Wrap in `test.describe('POST /auth — create token')`
    - Use `test.step` for arrange/act/assert phases
    - Call `validate('tokenResponse', body)` before assertions
    - Remove all `console.log` calls; use `test.info().annotations` for debug output
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.6_

  - [~] 9.2 Create `tests/booking/create/createBooking.spec.js`
    - Use `apiClient` fixture; call `createBookingPayload()` for request body
    - Validate response with `validate('bookingIdResponse', body)`
    - Assert `bookingid` is an integer and returned `booking` matches sent payload
    - _Requirements: 6.1, 6.2, 6.5, 6.6, 4.4_

  - [~] 9.3 Create `tests/booking/read/getAllBookings.spec.js`
    - Use `apiClient` fixture; call `apiClient.getBookings()`
    - Validate response with `validate('bookingListResponse', body)`
    - Assert response is a non-empty array
    - _Requirements: 6.1, 6.2, 6.5, 6.6_

  - [~] 9.4 Create `tests/booking/read/getBookingById.spec.js`
    - Use `createdBooking` fixture; call `apiClient.getBooking(bookingId)`
    - Validate response with `validate('bookingResponse', body)`
    - Assert returned fields match the payload used to create the booking
    - _Requirements: 6.1, 6.2, 6.5, 6.6, 2.3, 2.4_

  - [~] 9.5 Create `tests/booking/read/getBookingsByFilter.spec.js`
    - Use `createdBooking` fixture; test both name-based (`firstname`, `lastname`) and date-based (`checkin`, `checkout`) filter scenarios in a single file
    - Consolidates current `06_` and `07_` files
    - Validate each response with `validate('bookingListResponse', body)`
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6_

  - [~] 9.6 Create `tests/booking/update/updateBooking.spec.js`
    - Use `createdBooking` fixture; call `apiClient.updateBooking(bookingId, newPayload)` (token handled internally)
    - Validate response with `validate('bookingResponse', body)`
    - Assert all updated fields are reflected in the response
    - _Requirements: 6.1, 6.2, 6.5, 6.6, 2.3, 2.4_

  - [~] 9.7 Create `tests/booking/update/partialUpdateBooking.spec.js`
    - Use `createdBooking` fixture; call `apiClient.partialUpdateBooking(bookingId, partialPayload)` (token handled internally)
    - Validate response with `validate('bookingResponse', body)`
    - Assert only the patched fields changed
    - _Requirements: 6.1, 6.2, 6.5, 6.6, 2.3, 2.4_

  - [~] 9.8 Create `tests/booking/delete/deleteBooking.spec.js`
    - Use `apiClient` and `authToken` fixtures; create a booking inline, then call `apiClient.deleteBooking(bookingId)` (token handled internally)
    - Assert status 201 and body `"Created"`
    - Do NOT use `createdBooking` fixture here (teardown would attempt a second delete)
    - _Requirements: 6.1, 6.2, 6.5, 6.6_

- [ ] 10. Update Playwright config and add ESLint
  - [~] 10.1 Update `playwright.config.js`
    - Load `dotenv` at the top of the config file
    - Set `baseURL` to `process.env.BASE_URL || 'https://restful-booker.herokuapp.com'`
    - Replace the `chromium` project entry with a single API-only project (no browser device)
    - Set `fullyParallel: false`
    - Add `allure-playwright` to the `reporter` array alongside `html`
    - _Requirements: 3.3, 3.4, 8.1, 10.3, 10.4_

  - [~] 10.2 Create `eslint.config.js`
    - Extend `eslint:recommended` and include `eslint-plugin-playwright` recommended rules
    - Enforce `no-console: error` and `no-var: error`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [~] 11. Add CI/CD pipeline and gitignore updates
  - Create `.github/workflows/playwright.yml`
    - Trigger on `push` and `pull_request` to `main`
    - Steps: checkout → setup Node 20 → `npm ci` → install Playwright browsers → `npm run lint` → `npm test` (using `test:ci` script) → upload `allure-results/` artifact (30-day retention)
    - Map `BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` from GitHub Actions secrets to env vars
    - Run on `ubuntu-latest`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  - Add `allure-results/` and `allure-report/` to `.gitignore`
  - _Requirements: 8.5_

- [~] 12. Remove legacy files and clean up
  - Delete the 10 original flat spec files (`tests/01_*.spec.js` through `tests/10_*.spec.js`)
  - Delete `test-data/booking-details.json`
  - Verify no remaining references to hardcoded credentials (`admin`, `password123`) or the static base URL in test or source files
  - _Requirements: 3.3, 4.4_

- [~] 13. Final checkpoint — Ensure all tests pass
  - Run `npm run lint` and confirm exit code 0
  - Run the full test suite and confirm all integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations per property
- Unit tests in `tests/unit/` mock the Playwright `request` object; they do not hit the live API
- Integration tests in `tests/booking/` and `tests/auth/` require the live Restful Booker API and valid credentials in `.env`
- The `createdBooking` fixture handles its own teardown — delete tests must not reuse it to avoid double-delete errors
