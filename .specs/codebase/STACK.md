# Stack

- Framework: NestJS 11 with TypeScript.
- ORM: Prisma 7 with PostgreSQL.
- Validation: Zod at the HTTP boundary.
- Error model: fp-ts Either in use-cases.
- Auth: JWT RS256 with Passport guards.
- Storage: AWS S3-compatible adapter, tested with LocalStack.
- Testing: Vitest, TestContainers, Supertest.

## Primary Entry Points

- [src/infra/main.ts](../../src/infra/main.ts)
- [src/infra/app.module.ts](../../src/infra/app.module.ts)
- [src/infra/env/env.ts](../../src/infra/env/env.ts)
- [database/prisma/schema.prisma](../../database/prisma/schema.prisma)
- [vitest.config.e2e.ts](../../vitest.config.e2e.ts)
