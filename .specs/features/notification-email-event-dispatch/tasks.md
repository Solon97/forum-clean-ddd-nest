# Tasks: Notification Email Event Dispatch

## Overview

Atomic implementation plan for strategy-based notification dispatch with initial email delivery, covering `AnswerCreatedEvent` and `QuestionBestAnswerDefinedEvent`.

## Conventions

- Status: `TODO` | `IN_PROGRESS` | `DONE` | `BLOCKED`
- Parallel marker: `[P]` tasks can run in parallel after dependencies are satisfied.
- Gate: task is only complete when code + tests pass.

## Task List

### T1 - Define notification dispatch contracts

- Status: `DONE`
- What:
  - Introduce contracts for strategy-based event dispatch and email delivery gateway.
  - Define a neutral notification intent model used between strategy and email sender.
- Where:
  - `src/domain/notification/` (new contracts/models under domain boundaries)
- Depends on:
  - none
- Reuses:
  - Existing domain events and repositories
- Done when:
  - A strategy contract exists (event -> intent|skip).
  - An email gateway contract exists in domain/gateway layer.
  - No infra imports in domain.
- Tests:
  - Type-level/compile validation only in this task.
- Gate:
  - `pnpm build`

### T2 - Implement `AnswerCreatedEvent` strategy

- Status: `DONE`
- What:
  - Create a strategy that handles `AnswerCreatedEvent`.
  - Resolve question author as recipient and generate subject/body content.
  - Return skip when question is not found.
- Where:
  - `src/domain/notification/strategies/` (new)
  - Optional supporting files under `src/domain/notification/`
- Depends on:
  - T1
- Reuses:
  - `QuestionRepository`
  - Existing message semantics from current listener behavior
- Done when:
  - Strategy accepts `AnswerCreatedEvent`.
  - Strategy returns a valid email intent for happy path.
  - Strategy returns skip on missing question.
- Tests:
  - Unit tests for success + missing question skip.
- Gate:
  - `pnpm test -- src/domain/notification/**/answer-created*.spec.ts`

### T3 - Implement `QuestionBestAnswerDefinedEvent` strategy

- Status: `DONE`
- What:
  - Create a strategy that handles `QuestionBestAnswerDefinedEvent`.
  - Resolve answer author as recipient and generate subject/body content.
  - Return skip when answer is not found.
- Where:
  - `src/domain/notification/strategies/` (new)
- Depends on:
  - T1
- Reuses:
  - `AnswerRepository`
  - Existing message semantics from current listener behavior
- Done when:
  - Strategy accepts `QuestionBestAnswerDefinedEvent`.
  - Strategy returns valid email intent for happy path.
  - Strategy returns skip on missing answer.
- Tests:
  - Unit tests for success + missing answer skip.
- Gate:
  - `pnpm test -- src/domain/notification/**/question-best-answer-defined*.spec.ts`

### T4 - Build strategy registry and dispatcher use-case

- Status: `TODO`
- What:
  - Implement dispatcher/orchestrator that:
    - receives a domain event
    - resolves matching strategy by event type
    - executes strategy
    - sends email through email gateway when intent exists
  - Keep behavior extensible for future event strategies.
- Where:
  - `src/domain/notification/use-cases/` (new dispatch use-case)
  - `src/domain/notification/strategies/` (registry/factory)
- Depends on:
  - T2
  - T3
- Reuses:
  - Contracts from T1
- Done when:
  - Dispatcher processes both initial event types.
  - Unknown or non-mapped events are ignored safely.
  - Strategy selection does not require editing existing strategies.
- Tests:
  - Unit tests for:
    - mapped event -> email sent
    - mapped event + skip -> email not sent
    - unmapped event -> no-op
- Gate:
  - `pnpm test -- src/domain/notification/use-cases/**/*.spec.ts`

### T5 - [P] Add infra email gateway implementation

- Status: `TODO`
- What:
  - Implement domain email gateway in infra layer.
  - Initial implementation can be provider-backed or placeholder adapter (as project policy allows), but must respect domain contract.
- Where:
  - `src/infra/` (new email adapter module/files)
- Depends on:
  - T1
- Reuses:
  - Existing env/config patterns from `src/infra/env/`
- Done when:
  - Infra class implements domain email gateway contract.
  - Class is injectable in Nest DI.
- Tests:
  - Unit test (if adapter has behavior) or wiring-level test.
- Gate:
  - `pnpm build`

### T6 - Wire dispatcher in domain listeners

- Status: `TODO`
- What:
  - Refactor current listeners to delegate to the new dispatcher use-case instead of embedding notification composition logic.
  - Keep listeners thin and event-focused.
- Where:
  - `src/domain/notification/listeners/answer-created-listener.ts`
  - `src/domain/notification/listeners/question-best-answer-defined-listener.ts`
- Depends on:
  - T4
- Reuses:
  - Existing DomainEvents subscriptions
- Done when:
  - Listeners only map incoming event to dispatcher call.
  - Existing event subscriptions remain active.
- Tests:
  - Update existing listener specs to assert dispatcher invocation/behavior.
- Gate:
  - `pnpm test -- src/domain/notification/listeners/**/*.spec.ts`

### T7 - Wire module bootstrap in infra app

- Status: `TODO`
- What:
  - Ensure notification listeners/dispatcher/email adapter are instantiated in Nest module graph.
  - Import notification module in root app module if needed.
- Where:
  - `src/infra/app.module.ts`
  - `src/infra/**` notification/database/DI modules as needed
- Depends on:
  - T5
  - T6
- Reuses:
  - Existing module binding style in infra database/auth/question/answer modules
- Done when:
  - Notification event pipeline boots with application start.
  - No manual instantiation outside DI.
- Tests:
  - Module wiring test or integration test that proves listeners subscribe on bootstrap.
- Gate:
  - `pnpm build`

### T8 - [P] Regression and behavior tests across event pipeline

- Status: `TODO`
- What:
  - Add/adjust tests to guarantee:
    - `AnswerCreatedEvent` triggers email dispatch intent.
    - `QuestionBestAnswerDefinedEvent` triggers email dispatch intent.
    - Missing aggregates skip safely.
    - Unmapped events are no-op.
- Where:
  - `src/domain/notification/**/*.spec.ts`
  - Optional integration tests in infra if needed
- Depends on:
  - T6
  - T7
- Reuses:
  - Existing in-memory repositories and helper assertions
- Done when:
  - All acceptance criteria `AC-001` to `AC-005` are covered by tests.
- Tests:
  - `pnpm test -- src/domain/notification/**/*.spec.ts`
- Gate:
  - `pnpm test`

### T9 - Final quality gate and cleanup

- Status: `TODO`
- What:
  - Run full checks and remove dead code from old listener composition paths.
  - Ensure naming and boundaries remain aligned with Clean DDD conventions.
- Where:
  - Files touched in T1-T8
- Depends on:
  - T8
- Reuses:
  - Existing lint/build/test scripts
- Done when:
  - No stale logic remains.
  - Build and tests are green.
- Tests:
  - `pnpm build`
  - `pnpm test`
  - `pnpm lint`
- Gate:
  - All commands pass

## Dependency Graph

- T1 -> T2, T3, T5
- T2 + T3 -> T4
- T4 -> T6
- T5 + T6 -> T7
- T6 + T7 -> T8
- T8 -> T9

## Requirement Traceability

- `NED-001` -> T2, T3, T6, T8
- `NED-002` -> T2, T3, T8
- `NED-003` -> T1, T5, T7, T8
- `NED-004` -> T1, T4, T8
- `NED-005` -> T2, T3, T4, T8
- `NED-006` -> T1, T5, T9
- `NED-007` -> T2, T3, T4, T8, T9
- `NED-008` -> T1, T4, T9
