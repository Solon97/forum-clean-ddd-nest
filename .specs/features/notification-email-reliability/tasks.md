# Notification Email Reliability with RabbitMQ Tasks

**Spec**: `.specs/features/notification-email-reliability/spec.md`
**Context**: `.specs/features/notification-email-reliability/context.md`
**Status**: Approved

---

## Execution Plan

### Phase 1: Foundation (Sequential)

`T1 -> T2 -> T3 -> T4`

### Phase 2: Core Implementation (Parallel where safe)

After `T4`:

- Parallel-safe unit tracks:
  - `T5 [P]`
  - `T6 [P]`
  - `T7 [P]`
  - `T8 [P]`
- Then converge:
  - `T9` (depends on T5, T6, T7, T8)
  - `T10` (depends on T9)
  - `T11` (depends on T9)

### Phase 3: Integration and Validation (Sequential)

`T12 -> T13 -> T14`

---

## Task Breakdown

### T1: Add Outbox and Idempotency Prisma Models

**What**: Add/align Prisma models for outbox and idempotency persistence according to the feature spec.
**Where**: `database/prisma/schema.prisma`
**Depends on**: None
**Reuses**: Existing Prisma naming/mapping patterns
**Requirements**: NER-FR-001, NER-FR-002, NER-FR-007, NER-NFR-006

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Outbox model exists with required fields and constraints.
- [ ] Idempotency model exists with unique `(consumer, message_id)` constraint.
- [ ] Prisma schema compiles.

**Tests**: none
**Gate**: `pnpm build`

---

### T2: Create Migration for Messaging Reliability Tables

**What**: Generate and verify migration for outbox and idempotency tables.
**Where**: `database/prisma/migrations/*`
**Depends on**: T1
**Reuses**: Existing migration conventions
**Requirements**: NER-FR-001, NER-FR-007

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Migration SQL created and checked into repository.
- [ ] Migration applies on development environment.
- [ ] Migration reflects expected indexes and uniqueness rules.

**Tests**: none
**Gate**: `pnpm build`

---

### T3: Extend Env Schema for RabbitMQ, Retry, and Email Provider Settings

**What**: Add environment variables required by messaging topology, retry policy, and email provider integration.
**Where**: `src/infra/env/env.ts`
**Depends on**: T2
**Reuses**: Existing Zod env validation patterns
**Requirements**: NER-FR-005, NER-FR-012, NER-NFR-003

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] RabbitMQ URL/exchange/queue/DLQ variables are validated.
- [ ] Retry policy variables are validated.
- [ ] Email provider and credentials variables are validated.

**Tests**: unit
**Gate**: `pnpm test`

---

### T4: Introduce Messaging Contracts for Event Envelope and Email Command

**What**: Create shared contracts for notification event envelope and provider-template-based email command payload.
**Where**: `src/infra/messaging/notification/`
**Depends on**: T3
**Reuses**: Existing domain event and gateway contract styles
**Requirements**: NER-FR-002, NER-FR-011, NER-FR-012, NER-CTX-001

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Event envelope contract includes stable event id, event type, payload, and correlation metadata.
- [ ] Email command contract supports `templateKey` and `templateVariables`.
- [ ] Contracts are used by subsequent messaging components.

**Tests**: unit
**Gate**: `pnpm test`

---

### T5: Implement Prisma Outbox Repository

**What**: Implement outbox repository adapter for enqueueing, claiming, and marking publication results.
**Where**: `src/infra/database/prisma/repositories/`
**Depends on**: T4
**Reuses**: Existing Prisma repository patterns
**Requirements**: NER-FR-001, NER-FR-003, NER-NFR-002

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Pending records can be queried/claimed deterministically.
- [ ] Published status and failure metadata are persisted.
- [ ] No infrastructure leakage into domain layer.

**Tests**: unit
**Gate**: `pnpm test`

---

### T6: Implement Prisma Idempotency Repository and Guard API

**What**: Implement idempotency persistence adapter and guard operations (`isProcessed`, `markProcessed`).
**Where**: `src/infra/database/prisma/repositories/`
**Depends on**: T4
**Reuses**: Existing repository interfaces and adapter style
**Requirements**: NER-FR-007, NER-FR-008, NER-NFR-001, NER-NFR-006

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Duplicate processing can be detected by consumer + message id.
- [ ] First successful processing is persisted exactly once.
- [ ] Duplicate path is safe under concurrent consumer execution.

**Tests**: unit
**Gate**: `pnpm test`

---

### T7: Implement RabbitMQ Topology Setup (Main, Retry, DLQ)

**What**: Add RabbitMQ topology bootstrap with main queue, retry queue/path, and dead-letter queue.
**Where**: `src/infra/messaging/rabbit/`
**Depends on**: T4
**Reuses**: Existing infra module and provider patterns
**Requirements**: NER-FR-004, NER-FR-006, NER-NFR-003

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Exchange and queues are declared with expected bindings.
- [ ] Retry routing and DLQ routing are configured.
- [ ] Queue names and routing keys come from env config.

**Tests**: unit
**Gate**: `pnpm test`

---

### T8: Implement Email Gateway Adapter for Provider Templates

**What**: Implement infrastructure email adapter that sends using template id/key and template variables.
**Where**: `src/infra/messaging/notification/`
**Depends on**: T4
**Reuses**: Existing gateway abstraction approach from auth/storage infra
**Requirements**: NER-FR-012, NER-CTX-001

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Adapter accepts normalized email command from strategy layer.
- [ ] Provider credentials are consumed from validated env.
- [ ] Local/mock mode exists for test execution.

**Tests**: unit
**Gate**: `pnpm test`

---

### T9: Implement Notification Strategy Contract, Registry, and Initial Strategies

**What**: Add strategy contract + registry and implement strategies for `AnswerCreatedEvent` and `QuestionBestAnswerDefinedEvent`.
**Where**: `src/infra/messaging/notification/`
**Depends on**: T5, T6, T7, T8
**Reuses**: Existing notification listener semantics from domain layer
**Requirements**: NER-FR-009, NER-FR-010, NER-FR-011, NER-AC-006, NER-AC-007

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Strategy interface is explicit and event-type keyed.
- [ ] Registry resolves strategy by event type without condition-chain growth.
- [ ] Initial two strategies map payload to template-based email commands.

**Tests**: unit
**Gate**: `pnpm test`

---

### T10: Implement Notification Consumer Pipeline with Idempotency

**What**: Build consumer flow that validates envelope, applies idempotency guard, resolves strategy, and dispatches email.
**Where**: `src/infra/messaging/notification/`
**Depends on**: T9
**Reuses**: Contracts and repositories from previous tasks
**Requirements**: NER-FR-007, NER-FR-008, NER-FR-009, NER-FR-012, NER-AC-005

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Duplicate message path acks and skips side effects.
- [ ] First-time message path executes strategy + email dispatch.
- [ ] Processing status is persisted/observable.

**Tests**: integration
**Gate**: `pnpm test && pnpm build`

---

### T11: Implement Retry Scheduler with Exponential Backoff + Jitter and DLQ Metadata

**What**: Add failure handling logic that requeues with exponential backoff + jitter and dead-letters with full diagnostics after max retries.
**Where**: `src/infra/messaging/rabbit/` and `src/infra/messaging/notification/`
**Depends on**: T9
**Reuses**: Queue topology from T7 and policy from context decisions
**Requirements**: NER-FR-005, NER-FR-006, NER-CTX-002, NER-CTX-003, NER-AC-003, NER-AC-004

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Retry delay follows exponential backoff with jitter and configured bounds.
- [ ] Max retry exhaustion routes message to DLQ.
- [ ] DLQ metadata includes correlation id, attempt, and error details for analysis.

**Tests**: integration
**Gate**: `pnpm test && pnpm build`

---

### T12: Implement Outbox Publisher Worker

**What**: Build worker that polls/claims outbox pending events and publishes to RabbitMQ reliably.
**Where**: `src/infra/messaging/outbox/`
**Depends on**: T10, T11
**Reuses**: Outbox repository from T5 and rabbit publisher from T7
**Requirements**: NER-FR-003, NER-AC-001, NER-AC-002, NER-NFR-002

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Worker claims pending events without double-claim side effects.
- [ ] Publish success marks outbox records as published.
- [ ] Publish failure records error and keeps event recoverable.

**Tests**: integration
**Gate**: `pnpm test && pnpm build`

---

### T13: Wire Messaging/Notification Modules into Application Bootstrap

**What**: Register messaging and notification infrastructure modules in app bootstrap and dependency graph.
**Where**: `src/infra/app.module.ts` and related infra modules
**Depends on**: T12
**Reuses**: Existing NestJS module wiring patterns
**Requirements**: NER-NFR-005

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] App boots with messaging modules enabled.
- [ ] No circular dependency introduced.
- [ ] Existing resources keep functioning.

**Tests**: integration
**Gate**: `pnpm test && pnpm build`

---

### T14: Add End-to-End Reliability Coverage and Update E2E Projects if Needed

**What**: Add e2e scenarios for event publication, retry/DLQ, and idempotent consumption; update vitest e2e projects/scripts if new resource suite is introduced.
**Where**: `src/infra/resources/**/__test__/`, `vitest.config.e2e.ts`, `package.json`
**Depends on**: T13
**Reuses**: Existing e2e project conventions and setup
**Requirements**: NER-AC-001, NER-AC-003, NER-AC-004, NER-AC-005

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] E2E tests assert outbox-to-consumer reliability behavior.
- [ ] E2E tests cover duplicate delivery no-op semantics.
- [ ] E2E tests cover retry exhaustion -> DLQ path.
- [ ] `pnpm test:e2e` passes with project conventions preserved.

**Tests**: e2e
**Gate**: `pnpm test:e2e`

---

## Parallel Execution Map

Phase 1 (Sequential)
- `T1 -> T2 -> T3 -> T4`

Phase 2 (Parallel + Converge)
- `T4 -> (T5 [P], T6 [P], T7 [P], T8 [P]) -> T9 -> (T10, T11) -> T12`

Phase 3 (Sequential)
- `T12 -> T13 -> T14`

Parallelism constraints applied:
- Unit-test tasks marked `[P]` only where dependencies allow.
- Integration and e2e validation tasks remain sequential to reduce shared environment contention.
- E2E remains non-parallel by project convention (`maxWorkers: 1`).

---

## Task Granularity Check

| Task | Scope | Result |
| --- | --- | --- |
| T1 | 1 schema deliverable | ✅ |
| T2 | 1 migration deliverable | ✅ |
| T3 | 1 env-schema deliverable | ✅ |
| T4 | 1 contract package deliverable | ✅ |
| T5 | 1 repository deliverable | ✅ |
| T6 | 1 idempotency deliverable | ✅ |
| T7 | 1 topology deliverable | ✅ |
| T8 | 1 email adapter deliverable | ✅ |
| T9 | 1 strategy subsystem deliverable | ✅ |
| T10 | 1 consumer pipeline deliverable | ✅ |
| T11 | 1 retry/DLQ policy deliverable | ✅ |
| T12 | 1 publisher worker deliverable | ✅ |
| T13 | 1 wiring deliverable | ✅ |
| T14 | 1 e2e validation deliverable | ✅ |

---

## Diagram-Definition Cross-Check

| Task | Depends on (definition) | Depends on (diagram) | Match |
| --- | --- | --- | --- |
| T1 | None | Starts first | ✅ |
| T2 | T1 | After T1 | ✅ |
| T3 | T2 | After T2 | ✅ |
| T4 | T3 | After T3 | ✅ |
| T5 | T4 | Branch from T4 | ✅ |
| T6 | T4 | Branch from T4 | ✅ |
| T7 | T4 | Branch from T4 | ✅ |
| T8 | T4 | Branch from T4 | ✅ |
| T9 | T5,T6,T7,T8 | Converge after all four | ✅ |
| T10 | T9 | After T9 | ✅ |
| T11 | T9 | After T9 | ✅ |
| T12 | T10,T11 | After both complete | ✅ |
| T13 | T12 | After T12 | ✅ |
| T14 | T13 | After T13 | ✅ |

---

## Test Co-location Validation

| Task | Test Type | TESTING.md Alignment | Parallel-safe | Gate |
| --- | --- | --- | --- | --- |
| T1 | none | Infra/schema setup task | Yes | `pnpm build` |
| T2 | none | Migration setup task | Yes | `pnpm build` |
| T3 | unit | Unit for configuration validation | Yes | `pnpm test` |
| T4 | unit | Unit for contracts/mappers | Yes | `pnpm test` |
| T5 | unit | Unit for repository behavior | Yes | `pnpm test` |
| T6 | unit | Unit for idempotency behavior | Yes | `pnpm test` |
| T7 | unit | Unit for topology config | Yes | `pnpm test` |
| T8 | unit | Unit for email adapter mapping | Yes | `pnpm test` |
| T9 | unit | Unit for strategy resolution/transform | Yes | `pnpm test` |
| T10 | integration | Integration for consumer flow | No | `pnpm test && pnpm build` |
| T11 | integration | Integration for retry/DLQ | No | `pnpm test && pnpm build` |
| T12 | integration | Integration for outbox publisher | No | `pnpm test && pnpm build` |
| T13 | integration | Integration for app wiring | No | `pnpm test && pnpm build` |
| T14 | e2e | E2E for reliability scenarios | No (`maxWorkers: 1`) | `pnpm test:e2e` |

---

## Execution Readiness Note

Before starting execution, confirm tool preference per task (MCPs/skills) and then move `Status` from `Draft` to `Approved`.
