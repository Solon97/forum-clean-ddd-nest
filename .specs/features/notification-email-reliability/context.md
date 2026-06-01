# Feature Context: Notification Email Reliability with RabbitMQ

## Status

- Finalized
- Date: 2026-06-01
- Related spec: `spec.md`

## Goal of This Context

Capture product and technical decisions for previously open points in the feature spec, so implementation can proceed without ambiguity.

## Decisions

### NER-CTX-001: Email Rendering Approach

Decision:
- Use provider templates in this increment.

Details:
- Strategies will output a normalized email command with `templateKey` + `templateVariables` instead of fully rendered HTML.
- Template ownership stays in the email provider (or provider-compatible template registry), reducing application-side rendering complexity in v1.
- Internal renderer remains a future option if portability requirements increase.

Rationale:
- Faster delivery for this feature.
- Better compatibility with transactional email provider tooling (preview, versioning, analytics).
- Keeps strategy handlers focused on business mapping, not HTML composition.

Consequences:
- Requires template versioning discipline in provider.
- Local development should support a mock email gateway that validates template payload shape.

### NER-CTX-002: Retry Policy

Decision:
- Use exponential backoff with jitter.

Policy:
- `delayMs = min(baseDelayMs * 2^attempt, maxDelayMs) + random(0, jitterMs)`
- Initial defaults:
  - `baseDelayMs = 5000`
  - `maxDelayMs = 300000` (5 min)
  - `jitterMs = 1000`
  - `maxRetries = 8`

Rationale:
- Reduces synchronized retry spikes (thundering herd).
- Handles transient failures better than fixed intervals.
- Still deterministic at policy level while introducing bounded randomness for resilience.

Consequences:
- Retry schedule is not strictly predictable per single message, but bounded and observable.
- Metrics and logs must include attempt count and next scheduled delay.

### NER-CTX-003: DLQ Replay Scope

Decision:
- DLQ replay tooling is out of scope for this increment.
- This feature will guarantee DLQ persistence + operability hooks for manual analysis.

Operational expectation in this increment:
- Messages dead-lettered with failure metadata and correlation id.
- Operators can inspect and export DLQ payloads for manual replay/runbook actions.

Rationale:
- Keeps current scope focused on reliability foundation (outbox, retry, idempotency, strategy, email delivery).
- Avoids introducing operational command surface before core pipeline stabilizes.

Consequences:
- A follow-up feature will add safe replay tooling (with idempotency-aware reprocessing guardrails).

## Implementation Constraints Derived from Decisions

- Strategies must return provider-template oriented payload (`templateKey`, `templateVariables`, `subject`, `recipient`).
- Retry scheduler must implement exponential backoff with jitter and configurable bounds.
- DLQ records must preserve enough metadata for manual replay later:
  - `eventId`
  - `eventType`
  - `consumer`
  - `attempt`
  - `errorMessage`
  - `stack` (when available)
  - `correlationId`
  - `deadLetteredAt`

## Follow-up Item (Explicitly Deferred)

- NER-POST-001: Build DLQ replay tool/API/worker with audit logging and rate-limited requeue.
