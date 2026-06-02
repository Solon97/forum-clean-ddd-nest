# Feature Spec: Notification Event Dispatch via Email

## Status

Specified

## Context

The codebase already has domain events for forum interactions and notification listeners for:

- `AnswerCreatedEvent`
- `QuestionBestAnswerDefinedEvent`

Currently, notifications are persisted through the notification use-case, but there is no defined feature-level contract for event-to-email delivery flow that can scale to additional event types.

## Objective

Define a notification dispatch flow where domain events trigger notifications that are initially delivered by email, while keeping the architecture open to support additional event types in the future.

## Scope

In scope:

- Define event-driven notification dispatch for `AnswerCreatedEvent` and `QuestionBestAnswerDefinedEvent`
- Define email as the first delivery channel
- Define an extension model for adding new event types without changing existing dispatch core behavior
- Preserve Clean DDD boundaries and existing `Either`-based error flow

Out of scope:

- Building real-time channels (websocket, push, in-app live updates)
- User-facing notification preference center
- New forum domain events unrelated to notification dispatch

## Requirements

### Functional Requirements

- `NED-001` The system must react to domain events and trigger notification dispatch when:
  - an answer is created (`AnswerCreatedEvent`)
  - a best answer is defined for a question (`QuestionBestAnswerDefinedEvent`)
- `NED-002` The dispatch process must resolve recipient and message payload according to event semantics:
  - new answer: notify the question author
  - best answer selected: notify the answer author
- `NED-003` The first delivery channel must be email.
- `NED-004` Event handling must use a strategy-based mapping (`event type -> notification strategy`) so that new supported events can be added by introducing a new strategy and wiring it, without modifying existing strategy implementations.
- `NED-005` If event payload does not resolve the required aggregate data (e.g., missing question/answer), the system must skip sending for that event instance without breaking the event pipeline.

### Non-Functional Requirements

- `NED-006` The design must keep domain layer independent from infrastructure delivery implementations (email provider adapters stay in infra).
- `NED-007` Dispatch flow must be testable with unit tests for each event strategy and integration coverage for event subscription wiring.
- `NED-008` The architecture must allow additional event strategies in future (e.g., comments, mentions, moderation actions) with minimal changes to existing code.

## Proposed Solution Shape

- Keep domain events as the trigger source.
- Introduce a strategy contract for notification event translation, for example:
  - input: domain event instance
  - output: notification intent (recipient, title, content, metadata) or skip
- Use an orchestrator/dispatcher to:
  - identify event type
  - select matching strategy
  - execute strategy
  - forward resulting notification intent to email delivery gateway
- Keep listeners thin, delegating behavior to strategy-driven dispatcher.

## Acceptance Criteria

- `AC-001` When `AnswerCreatedEvent` is dispatched, an email notification intent is generated for the question author with proper title/content.
- `AC-002` When `QuestionBestAnswerDefinedEvent` is dispatched, an email notification intent is generated for the answer author with proper title/content.
- `AC-003` Adding a new notification event type does not require changing logic inside existing event strategies.
- `AC-004` Missing referenced data (question/answer not found) does not crash dispatch flow and does not produce invalid notification delivery.
- `AC-005` Unit tests cover both initial strategies and validate skip behavior on missing data.

## Risks and Notes

- Root module bootstrap currently does not import notification wiring; execution plan must include bootstrap activation for listeners/dispatcher where applicable.

## Traceability

- User request: specify notification event dispatch with initial email delivery
- Initial events explicitly requested: `AnswerCreated` and `QuestionBestAnswerDefined`
- Future extensibility constraint addressed with strategy pattern
