# Forum Clean DDD NestJS — Agent Instructions

## Project Overview

A forum REST API built with **NestJS 11**, **Prisma 7 (PostgreSQL)**, and **Clean DDD** architecture. The codebase enforces strict separation between domain logic and infrastructure, using the Either monad for error handling and domain events for side effects.

---

## Commands

```bash
pnpm install              # Install dependencies
pnpm start:dev            # Dev server (watch mode) on port 3000
pnpm test                 # Unit tests (Vitest)
pnpm test:watch           # Unit tests in watch mode
pnpm test:e2e             # E2E tests (requires Docker — uses TestContainers)
pnpm test:cov             # Coverage report
pnpm build                # Compile to dist/
pnpm lint                 # ESLint with auto-fix
pnpm format               # Prettier format
```

### Database

```bash
# Apply migrations (dev)
cd database && npx prisma migrate dev

# Open Prisma Studio
cd database && npx prisma studio
```

Docker must be running for E2E tests (TestContainers spins up a PostgreSQL instance automatically).

---

## Architecture

```
src/
├── domain/         # Pure TypeScript — NO NestJS, NO DB, NO HTTP
│   ├── forum/      # Core subdomain (entities, use-cases, repositories, gateways)
│   └── notification/ # Notification subdomain
├── infra/          # Framework & adapters (NestJS modules, Prisma, JWT, controllers)
└── shared/         # Domain kernel shared across subdomains
test/
├── repositories/   # In-memory repository implementations (unit tests only)
├── factories/      # Entity factories (makeQuestion, makeAnswer, etc.)
└── helpers/        # assertEitherIsRight, assertSpyCalled
```

**Key rule:** Domain code must never import from `infra/`. Infra code wires implementations to domain contracts.

---

## Core Patterns

### Either Monad (fp-ts)

All use-cases return `Promise<Either<ErrorType, SuccessOutput>>`. Use `left()` for errors, `right()` for success.

```typescript
// src/shared/either/index.ts — re-exports from fp-ts
import { left, right, isLeft, isRight } from 'fp-ts/lib/Either';

// Use-case signature pattern:
async execute(input: Input): Promise<Either<UseCaseError, { entity: Entity }>>
```

In controllers, map `isLeft(result)` to HTTP error responses.

### Domain Events

- Aggregate roots call `this.addDomainEvent(new SomeEvent(...))` internally
- `DomainEvents.dispatchEventsForAggregate(aggregate.id)` is called by the repository after persist
- Event handlers implement `EventHandler` and are registered via `DomainEvents.register()`

### Repositories

Domain layer defines abstract repository interfaces (`src/domain/forum/repositories/`). Infrastructure provides Prisma implementations (`src/infra/database/prisma/`). Unit tests use in-memory implementations (`test/repositories/`).

### Gateways (external service contracts)

- `Hasher` — `src/domain/forum/gateways/hasher.ts` → implemented by `BcryptHasher`
- `Encrypter` — `src/domain/forum/gateways/encrypter.ts`
- `TokenGenerator` — `src/domain/forum/gateways/token-generator.ts`

### Value Objects

Constructed via static factory methods, never `new`. Validation returns `Either`.

```typescript
Slug.createFromText(text)                    // auto-normalizes
Slug.createFromExistingSlug(value)           // returns Either<InvalidSlugError, Slug>
new UniqueEntityId(optionalId)               // UUID-based identity
```

---

## Environment Variables

Defined and validated in [`src/infra/env/env.ts`](src/infra/env/env.ts) using Zod.

| Variable | Description | Required |
|---|---|---|
| `NODE_ENV` | `development` \| `production` \| `test` | No (default: `development`) |
| `PORT` | HTTP port | No (default: `3000`) |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_PRIVATE_KEY` | Base64-encoded RSA private key | Yes |
| `JWT_PUBLIC_KEY` | Base64-encoded RSA public key | Yes |

JWT keys must be RS256 RSA keys stored in `keys/` and exported as base64. See docker-compose for local DB setup.

---

## Auth Flow

- **Access token**: RS256 JWT, 15-minute expiry
- **Refresh token**: Stored hashed in `RefreshToken` table, revocable
- Routes requiring auth use `@UseGuards(JwtAuthGuard)`
- Inject current user with `@CurrentUser()` decorator

---

## Testing Conventions

- **Unit tests** (`*.spec.ts`): Use in-memory repositories from `test/repositories/`. No NestJS module, no DB.
- **E2E tests** (`*.e2e-spec.ts`): Use TestContainers (PostgreSQL), NestJS testing module, `supertest`.
- Use `assertEitherIsRight(result)` / `assertEitherIsLeft(result)` from `test/helpers/assert-either.ts`.
- Entity factories live in `test/factories/` — always use factories over inline entity creation.
- `vitest.config.e2e.ts` sets `maxWorkers: 1` — E2E tests run sequentially.

---

## Adding New Features — Checklist

1. **Domain entity** → `src/domain/forum/entities/`
2. **Repository interface** → `src/domain/forum/repositories/`
3. **Use-case** → `src/domain/forum/use-cases/` — returns `Either`
4. **Use-case unit test** → `src/domain/forum/use-cases/*.spec.ts`
5. **In-memory repository** → `test/repositories/` (for tests)
6. **Prisma repository** → `src/infra/database/prisma/`
7. **Controller** → `src/infra/resources/<domain>/`
8. **NestJS module wiring** → bind abstract repository to Prisma implementation in the module

---

## Key Files Reference

| File | Purpose |
|---|---|
| [`src/shared/either/index.ts`](src/shared/either/index.ts) | Either monad exports |
| [`src/shared/entities/aggregate-root.ts`](src/shared/entities/aggregate-root.ts) | Base aggregate with domain events |
| [`src/shared/entities/base-entity.ts`](src/shared/entities/base-entity.ts) | Base entity with `id`, timestamps, `touch()` |
| [`src/shared/events/domain-events.ts`](src/shared/events/domain-events.ts) | Domain event dispatcher |
| [`src/infra/env/env.ts`](src/infra/env/env.ts) | Zod env schema |
| [`src/infra/resources/auth/`](src/infra/resources/auth/) | JWT auth guards, strategies, controllers |
| [`database/prisma/schema.prisma`](database/prisma/schema.prisma) | Database schema |
| [`test/helpers/assert-either.ts`](test/helpers/assert-either.ts) | Test assertion helpers |
