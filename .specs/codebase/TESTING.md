# Testing

## Test Strategy

- Unit tests live alongside use-cases as `*.spec.ts`.
- E2E tests live under `src/infra/resources/<resource>/__test__/` as `*.e2e-spec.ts`.
- Unit tests use in-memory repositories from `test/repositories/`.
- E2E tests use PostgreSQL and LocalStack via TestContainers.

## E2E Setup

- `test/e2e/global-setup-e2e.ts` starts PostgreSQL and LocalStack, then runs Prisma migrations.
- `test/e2e/setup-e2e.ts` truncates tables before each test and disconnects Prisma after the suite.
- `vitest.config.e2e.ts` runs projects sequentially with `maxWorkers: 1`.

## E2E Projects

- `auth-e2e` for auth flows.
- `question-e2e` for question flows.
- `answer-e2e` for answer flows.
- `attachment-e2e` for attachment upload flows.

## Useful Helpers

- `test/helpers/assert-either.ts` provides `assertEitherIsRight` and `assertEitherIsLeft`.
- `test/factories/` provides entity factories for test setup.
