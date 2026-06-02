# State

## Decisions

- The project baseline is a forum API, not a greenfield product from scratch
- The initial specification should describe the existing platform before expanding it
- Clean DDD boundaries are a core constraint, not an optional implementation detail
- Notification dispatch feature will use strategy-based event handling to support multiple domain events over time
- Email is the first notification delivery channel for event-driven dispatch

## Blockers

- None identified yet

## Todos

- Brownfield map the codebase
- Capture the first feature specification for the next area of change
- Record any architectural concerns that emerge during deeper inspection
- Plan execution tasks for `notification-email-event-dispatch`

## Progress

- Brownfield codebase mapping completed in `.specs/codebase/`
- Feature spec created in `.specs/features/notification-email-event-dispatch/spec.md`

## Notes

- Notification listeners and messaging infrastructure exist, but the root application module does not bootstrap the notification subdomain yet.

## Deferred Ideas

- Voting and reputation
- Search and discovery improvements
- Moderation tooling
- Real-time notifications
