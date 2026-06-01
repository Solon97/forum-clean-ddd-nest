# State

## Decisions

- The project baseline is a forum API, not a greenfield product from scratch
- The initial specification should describe the existing platform before expanding it
- Clean DDD boundaries are a core constraint, not an optional implementation detail

## Blockers

- None identified yet

## Todos

- Define scope and design for deferred DLQ replay tooling feature

## Progress

- Brownfield codebase mapping completed in `.specs/codebase/`
- Feature specification created: `.specs/features/notification-email-reliability/spec.md`
- Feature context decisions finalized: `.specs/features/notification-email-reliability/context.md`
- Feature task breakdown created: `.specs/features/notification-email-reliability/tasks.md`

## Notes

- Notification listeners and messaging infrastructure exist, but the root application module does not bootstrap the notification subdomain yet.
- Current Prisma schema does not yet expose outbox/idempotency models, so schema alignment is required before implementation.

## Deferred Ideas

- Voting and reputation
- Search and discovery improvements
- Moderation tooling
- Real-time notifications
