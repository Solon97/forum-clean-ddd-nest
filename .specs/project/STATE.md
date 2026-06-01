# State

## Decisions

- The project baseline is a forum API, not a greenfield product from scratch
- The initial specification should describe the existing platform before expanding it
- Clean DDD boundaries are a core constraint, not an optional implementation detail

## Blockers

- None identified yet

## Todos

- Brownfield map the codebase
- Capture the first feature specification for the next area of change
- Record any architectural concerns that emerge during deeper inspection

## Progress

- Brownfield codebase mapping completed in `.specs/codebase/`

## Notes

- Notification listeners and messaging infrastructure exist, but the root application module does not bootstrap the notification subdomain yet.

## Deferred Ideas

- Voting and reputation
- Search and discovery improvements
- Moderation tooling
- Real-time notifications
