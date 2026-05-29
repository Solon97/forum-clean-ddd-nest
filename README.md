# Forum — Clean DDD with NestJS

A forum REST API built following **Clean Architecture** and **Domain-Driven Design** principles. The project serves as a reference implementation of DDD patterns in TypeScript with NestJS, featuring strict layer separation, the Either monad for functional error handling, aggregate roots, domain events, and value objects.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | NestJS 11 |
| **Language** | TypeScript 5 (strict mode) |
| **Database** | PostgreSQL via Prisma 7 |
| **Auth** | JWT RS256 + Refresh Tokens |
| **Validation** | Zod |
| **Testing** | Vitest + TestContainers |
| **Error handling** | fp-ts Either monad |
| **Build** | SWC |

## Architecture

The codebase follows a three-layer architecture with strict dependency rules:

```
src/
├── domain/         # Pure business logic — no framework, no DB
│   ├── forum/      # Forum subdomain (questions, answers, comments, users)
│   └── notification/ # Notification subdomain
├── infra/          # Framework adapters (NestJS, Prisma, JWT, controllers)
└── shared/         # Domain kernel (AggregateRoot, Either, DomainEvents)
```

**The golden rule:** `domain/` never imports from `infra/`. Only `infra/` knows about frameworks and databases.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker (required for E2E tests and local database)

### Setup

```bash
# Install dependencies
pnpm install

# Start the database
docker compose up -d

# Apply migrations
npx prisma migrate dev --schema database/prisma/schema.prisma

# Start dev server
pnpm start:dev
```

### Environment Variables

Create a `.env` file at the project root:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://docker:docker@localhost:5432/nest_clean

# Base64-encoded RSA key pair (RS256)
JWT_PRIVATE_KEY=<base64_private_key>
JWT_PUBLIC_KEY=<base64_public_key>
```

RSA keys are stored in `keys/` and must be base64-encoded before setting as env vars.

## Running the Application

```bash
pnpm start:dev      # Development (watch mode)
pnpm start          # Production-like (compiled)
pnpm build          # Compile to dist/
pnpm start:prod     # Run compiled output
```

## Testing

```bash
pnpm test           # Unit tests
pnpm test:watch     # Unit tests in watch mode
pnpm test:cov       # Coverage report
pnpm test:e2e       # E2E tests (requires Docker)
```

Unit tests run against in-memory repositories — no DB or Docker required. E2E tests use TestContainers to spin up a real PostgreSQL instance automatically.

## API Endpoints

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/signup` | Register a new student |
| `POST` | `/auth/signin` | Authenticate and receive token pair |
| `POST` | `/auth/refresh` | Rotate refresh token |
| `POST` | `/auth/signout` | Revoke refresh token |

### Questions

| Method | Path | Description |
|---|---|---|
| `POST` | `/questions` | Create a question |
| `GET` | `/questions` | List recent questions (paginated) |
| `GET` | `/questions/:slug` | Get question by slug |
| `PUT` | `/questions/:id` | Update a question |
| `DELETE` | `/questions/:id` | Delete a question |
| `PATCH` | `/questions/:id/best-answer/:answerId` | Set best answer |

### Answers

| Method | Path | Description |
|---|---|---|
| `POST` | `/questions/:questionId/answers` | Answer a question |
| `GET` | `/questions/:questionId/answers` | List answers |
| `PUT` | `/answers/:id` | Update an answer |
| `DELETE` | `/answers/:id` | Delete an answer |

### Comments

| Method | Path | Description |
|---|---|---|
| `POST` | `/questions/:questionId/comments` | Comment on question |
| `POST` | `/answers/:answerId/comments` | Comment on answer |
| `GET` | `/questions/:questionId/comments` | List question comments |
| `GET` | `/answers/:answerId/comments` | List answer comments |
| `DELETE` | `/questions/comments/:id` | Delete question comment |
| `DELETE` | `/answers/comments/:id` | Delete answer comment |

## DDD Patterns

- **Aggregate Roots** — `Question`, `Answer` extend `AggregateRoot` and manage domain events internally
- **Value Objects** — `Slug`, `UniqueEntityId` constructed via static factory methods with validation
- **Domain Events** — `AnswerCreatedEvent`, `SetQuestionBestAnswerEvent` trigger cross-aggregate side effects
- **Either Monad** — All use-cases return `Promise<Either<Error, Output>>` — no exceptions in domain layer
- **Repository Pattern** — Domain interfaces; Prisma and in-memory implementations injected at runtime
- **Watched Lists** — `QuestionAttachmentList`, `AnswerAttachmentList` track attachment changes for partial updates

## Project Structure (detailed)

See [AGENTS.md](AGENTS.md) for a full breakdown of key files, patterns, and conventions useful when working on this codebase.
