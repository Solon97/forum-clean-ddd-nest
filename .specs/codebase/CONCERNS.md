# Concerns

## Bootstrap Coverage

- `AppModule` currently wires auth, database, questions, answers, attachments, and env config.
- The notification subdomain exists, but it is not imported into the root module.

## Messaging Maturity

- The `src/infra/messaging/` tree suggests outbox and RabbitMQ support, but the main application bootstrap does not currently depend on it.

## Operational Dependencies

- E2E tests depend on Docker, PostgreSQL, and LocalStack.
- Environment validation requires all JWT keys and database settings to be present.

## Product Gaps

- The codebase does not show voting, reputation, moderation tooling, or real-time collaboration flows.
