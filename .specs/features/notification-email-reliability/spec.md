# Feature Spec: Notification Email Reliability with RabbitMQ

## Status

- Proposed
- Date: 2026-06-01
- Owner: Platform/Application

## Context

The project already has domain notification listeners triggered by domain events (`AnswerCreatedEvent`, `QuestionBestAnswerDefinedEvent`), but the messaging flow is not bootstrapped in the root application module yet.

Current behavior creates notification records directly through use-cases. The next step is to make notification dispatch reliable and scalable for multiple event types, with asynchronous email delivery.

## Problem Statement

The current notification flow lacks end-to-end delivery guarantees for async message publishing and processing.

Risks today:
- Event can be lost between domain transaction and broker publication.
- Temporary broker or consumer failures can drop messages if no retry policy exists.
- Poison messages can block processing without a dead-letter path.
- Duplicate deliveries can trigger duplicate email sends.
- New notification event types require growing conditional logic instead of explicit extensibility.

## Goals

- Guarantee eventual publication of notification events using Outbox Pattern.
- Guarantee message handling outcome: delivered successfully or persisted for posterior analysis (DLQ).
- Guarantee effective once-only processing semantics for notification side effects via idempotency.
- Support multiple notification event types through Strategy Pattern with explicit extension points.
- Deliver notifications via email channel.

## Non-Goals

- Real-time websocket/push notifications.
- In-app notification UX redesign.
- Multi-channel delivery (SMS, push, WhatsApp) in this increment.
- Advanced campaign features (scheduling, templates management UI, A/B tests).

## Scope

In scope:
- Domain-to-outbox persistence for notification-triggering events.
- Outbox publisher worker to RabbitMQ exchange/queues.
- RabbitMQ retry + DLQ topology for notification events.
- Notification consumer with idempotent processing and strategy-based event routing.
- Email dispatch gateway integration.
- Observability, retries, and failure traceability.

Out of scope:
- Cross-bounded-context event bus for all forum events.
- Exactly-once semantics at broker level (will use at-least-once + idempotent consumer).

## Personas and Stakeholders

- End user: expects consistent email notifications without duplicates.
- Support/Operations: needs failed messages persisted and diagnosable.
- Engineering: needs extensible notification event handling with low coupling.

## Requirements

### Functional Requirements

- NER-FR-001: Domain events that represent email notification intents must be persisted to an Outbox table in the same database transaction as the business state change.
- NER-FR-002: Outbox records must include a stable event identifier, event type, payload, aggregate identifier, occurred timestamp, and publication metadata.
- NER-FR-003: A publisher process must read pending outbox records and publish them to RabbitMQ, then mark records as published atomically from the application perspective (no silent loss).
- NER-FR-004: RabbitMQ topology must include main queue, retry path, and DLQ for notification events.
- NER-FR-005: Failed processing attempts must be retried with bounded attempts and backoff policy configurable by environment variables.
- NER-FR-006: When max retries are exhausted, message must be routed to DLQ with failure reason metadata preserved.
- NER-FR-007: Consumer must enforce idempotency using a persistent idempotency store keyed by message/event id and consumer name.
- NER-FR-008: If a duplicate message is received, consumer must ack and skip side effects.
- NER-FR-009: Notification processing must use Strategy Pattern: each event type maps to a dedicated strategy implementing a shared contract.
- NER-FR-010: Adding a new notification event type must require only a new strategy and wiring entry, without modifying existing strategy logic.
- NER-FR-011: Strategies must transform event payload into a normalized email command (recipient, subject, body/template, metadata).
- NER-FR-012: Email sending must happen through an infrastructure gateway abstraction to keep domain/application decoupled from provider SDK.
- NER-FR-013: Processing result status must be recorded (`processed`, `duplicate`, `failed`, `dead-lettered`) with timestamps for auditability.

### Non-Functional Requirements

- NER-NFR-001: Delivery model must be at-least-once from broker perspective, with effectively-once side effects through idempotent consumer.
- NER-NFR-002: No event loss is acceptable between successful business transaction commit and eventual broker publication.
- NER-NFR-003: Retry and DLQ behavior must be deterministic and configurable without code changes.
- NER-NFR-004: Observability must include structured logs, counters for published/retried/dead-lettered/processed/duplicate, and correlation ids.
- NER-NFR-005: Solution must preserve Clean DDD boundaries: domain layer cannot import RabbitMQ or email provider SDK.
- NER-NFR-006: Feature must support horizontal scaling of consumers without breaking idempotency guarantees.

## Domain Events Covered in Initial Increment

- `AnswerCreatedEvent` -> email notification to question author.
- `QuestionBestAnswerDefinedEvent` -> email notification to answer author.

Future event types are expected and must follow the same strategy registration mechanism.

## Data Model Changes (Expected)

- Outbox entity/table:
  - `id` (uuid)
  - `event_id` (unique stable id)
  - `event_type`
  - `aggregate_id`
  - `payload` (json)
  - `status` (`pending`, `published`, `failed`)
  - `attempts`
  - `available_at`
  - `published_at`
  - `last_error`
  - timestamps
- Idempotency entity/table:
  - `id` (uuid)
  - `consumer`
  - `message_id` (unique per consumer)
  - `processed_at`
  - optional processing hash/metadata

Note: if schema elements already exist from previous migration work, this feature reuses and aligns naming/constraints instead of duplicating structures.

## Configuration

Required environment variables (names illustrative, final names must follow project env conventions):
- `RABBITMQ_URL`
- `RABBITMQ_NOTIFICATION_EXCHANGE`
- `RABBITMQ_NOTIFICATION_QUEUE`
- `RABBITMQ_NOTIFICATION_RETRY_QUEUE`
- `RABBITMQ_NOTIFICATION_DLQ`
- `NOTIFICATION_MAX_RETRIES`
- `NOTIFICATION_RETRY_BACKOFF_MS`
- `EMAIL_PROVIDER` and provider credentials

## Acceptance Criteria

- NER-AC-001: When a business action emits a notification event and transaction commits, an outbox record exists even if RabbitMQ is unavailable at that moment.
- NER-AC-002: When RabbitMQ becomes available, pending outbox events are published and marked as published.
- NER-AC-003: When consumer fails transiently, message is retried until max retries.
- NER-AC-004: When retries are exhausted, message is routed to DLQ and remains available for operator analysis.
- NER-AC-005: Receiving the same message more than once does not send duplicate emails.
- NER-AC-006: Existing event types (`AnswerCreatedEvent`, `QuestionBestAnswerDefinedEvent`) are processed through dedicated strategies and produce correct email commands.
- NER-AC-007: Adding a new event type requires creating a new strategy class and registration only, with no branching changes inside existing strategies.

## Testing Strategy

- Unit tests:
  - Strategy mapping and payload-to-email transformation.
  - Idempotency guard behavior (`first -> process`, `duplicate -> skip`).
  - Outbox domain/application services behavior.
- Integration tests:
  - Outbox publisher reads pending records and marks publish status.
  - Consumer retry flow and DLQ routing (can use test doubles for broker adapter where needed).
- E2E tests:
  - Resource-level flow triggering notification event and validating asynchronous delivery contract.
  - Failure scenario that lands in DLQ and is queryable for analysis.

## Dependencies and Risks

Dependencies:
- RabbitMQ runtime availability in dev/test/prod.
- Email provider credentials and sandbox/domain setup.
- Finalized Prisma schema for outbox + idempotency tables.

Risks:
- Duplicate publication if publisher crash occurs between publish and status update.
- Ordering assumptions across different event types.
- Poison messages from malformed payloads.

Mitigations:
- Idempotent consumer is mandatory.
- Correlation ids and error metadata on retries/DLQ.
- Strict schema validation of event payload before strategy execution.

## Rollout and Migration Notes

- Roll out in shadow mode first (publish + consume with non-critical mailbox) when possible.
- Keep current synchronous notification persistence behavior until async pipeline is validated.
- Introduce alerting thresholds for DLQ growth and retry saturation.

## Open Questions

- Resolved in `context.md`:
  - NER-CTX-001: Use provider templates in this increment.
  - NER-CTX-002: Use exponential backoff with jitter.
  - NER-CTX-003: Keep DLQ replay tooling as follow-up scope.

## Traceability Summary

- Outbox guarantee: NER-FR-001..003, NER-NFR-002, NER-AC-001..002
- Retry + DLQ guarantee: NER-FR-004..006, NER-AC-003..004
- Idempotency guarantee: NER-FR-007..008, NER-NFR-001, NER-AC-005
- Strategy extensibility: NER-FR-009..011, NER-AC-006..007
- Email channel: NER-FR-012, covered across AC-006
