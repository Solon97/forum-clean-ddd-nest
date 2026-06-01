# Roadmap

## Now

- Keep the current forum core stable and well-tested
- Maintain the auth, question, answer, comment, attachment, and notification flows
- Tighten the project specification around existing capabilities before adding new surface area

## Next

- Brownfield map the existing codebase into architecture, conventions, testing, and integration notes
- Capture the main domain concepts and their boundaries in feature specs
- Identify the smallest missing product gaps worth turning into feature work
- Specify and implement reliable email notification delivery with RabbitMQ (outbox, retry, DLQ, idempotency, strategy-based event handlers)

## Later

- Improve notification delivery and user experience
- Add richer discovery and filtering if the product needs it
- Consider moderation, reputation, or collaboration features only if they support the core forum model

## Notes

- The repository already implements a substantial forum core, so the roadmap should stay incremental
- New work should preserve the Clean DDD boundaries already established in the codebase
