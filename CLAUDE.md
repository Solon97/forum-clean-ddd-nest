# Forum Clean DDD NestJS — Claude Instructions

> This file extends [`AGENTS.md`](AGENTS.md) with Claude-specific guidance. Read `AGENTS.md` first for the full project context, commands, and architecture.

---

## Navigation Tips for Claude

When exploring this codebase, prioritize these entry points:

- **Domain model**: `src/domain/forum/entities/` — start here to understand data structures
- **Business logic**: `src/domain/forum/use-cases/` — one file per use case
- **Contracts**: `src/domain/forum/repositories/` and `src/domain/forum/gateways/` — interfaces only
- **Wiring**: `src/infra/database/database.module.ts` and `src/infra/app.module.ts` — NestJS DI bindings
- **HTTP layer**: `src/infra/resources/` — controllers and their service adapters

---

## What Claude Should Know

### Strict Layer Boundaries

Never suggest importing infrastructure types into the domain layer. If a use-case needs to hash a password, it must depend on the `Hasher` gateway interface — not `BcryptHasher`.

### Either Error Handling

This project does not throw exceptions in use-cases. All errors are expressed as `left(new SomeError())`. When editing or adding use-case code, keep this discipline:

```typescript
// Correct — returns Either
if (!question) return left(new ResourceNotFoundError())
return right({ question })

// Incorrect — never throw in use-cases
if (!question) throw new NotFoundException()
```

### Module Wiring Pattern

When adding a new repository or gateway, the pattern is always:
1. Abstract interface in `src/domain/.../repositories/` or `src/domain/.../gateways/`
2. Implementation in `src/infra/database/prisma/` or `src/infra/cryptography/`
3. NestJS `provide` / `useClass` binding in the relevant module

### Entity Creation

Never call domain entity constructors directly. Always use the static factory method:

```typescript
// Correct
const question = Question.create({ title, content, authorId, attachmentIds })

// Incorrect
const question = new Question({ ... })
```

### WatchedList for Collections

Attachment changes on aggregates use `WatchedList` (`src/shared/entities/watched-list.ts`). When modifying collections on an aggregate (e.g., `question.attachments`), call the list's mutation methods — this enables change tracking for partial DB updates.

---

## Testing Guidance for Claude

When writing unit tests:
- Import in-memory repos from `test/repositories/`, not Prisma repos
- Create test entities using factories from `test/factories/`
- Assert results using helpers from `test/helpers/assert-either.ts`
- Never use `expect(result._tag).toBe('Right')` — use `assertEitherIsRight(result)` instead

When writing E2E tests:
- File pattern: `*.e2e-spec.ts`
- Use `@testcontainers/postgresql` — no manual DB setup needed
- Check `test/e2e/global-setup-e2e.ts` and `test/e2e/setup-e2e.ts` for bootstrap logic
- Follow the repository E2E projects convention in `vitest.config.e2e.ts`:
	- tests are grouped by resource with project names `<resource>-e2e`
	- each project includes only files from `src/infra/resources/<resource>/__test__/`
	- do not add a global E2E `include` at root config level
- When creating E2E tests for a new resource, also update:
	- `test.projects` in `vitest.config.e2e.ts`
	- `package.json` with `test:e2e:<resource>` script
- Prefer resource-scoped runs while implementing (`pnpm test:e2e:<resource>`) and full suite before finishing (`pnpm test:e2e`).

---

## Common Pitfalls

| Pitfall | Correct Approach |
|---|---|
| Importing `PrismaService` in domain | Only infra can use Prisma |
| Throwing `HttpException` in use-cases | Return `left(new DomainError())` |
| Creating entities with `new Entity({...})` | Use `Entity.create({...})` |
| Directly mutating `entity.props` outside entity | Use entity mutation methods (e.g., `question.title = ...`) |
| Forgetting to dispatch domain events | Call `DomainEvents.dispatchEventsForAggregate(id)` after repository save |

---

## Prisma Schema Location

The Prisma schema is at `database/prisma/schema.prisma` — **not** `prisma/schema.prisma`. The `prisma.config.ts` at the root points to this path. Always run Prisma commands from the repo root or via `prisma.config.ts`.
