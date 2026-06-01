# Integrations

## Auth

- JWT uses RS256.
- Keys are read from `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` and decoded from base64.
- Access tokens expire in 15 minutes.
- Refresh tokens are persisted in `refresh_tokens`.

## Database

- Prisma uses PostgreSQL.
- The schema lives in [database/prisma/schema.prisma](../../database/prisma/schema.prisma).
- The Prisma client is generated into `src/infra/database/prisma/generated/`.

## Storage

- Attachment uploads use an S3-compatible gateway.
- Runtime configuration includes `S3_REGION`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, and `S3_SECRET_KEY`.
- E2E uses LocalStack to emulate S3.

## Messaging and Events

- Domain events are emitted by aggregates and dispatched after repository persistence.
- Notification listeners react to `AnswerCreatedEvent` and `QuestionBestAnswerDefinedEvent`.
- The `src/infra/messaging/` tree exists for outbox, notification, and RabbitMQ work, but it is not part of the main app module bootstrap yet.
