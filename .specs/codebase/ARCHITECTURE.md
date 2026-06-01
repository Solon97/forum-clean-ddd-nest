# Architecture

The codebase follows a Clean DDD layout with a strict dependency direction:

- `domain/` contains pure business rules, entities, repositories, gateways, and use-cases.
- `infra/` contains NestJS modules, controllers, adapters, Prisma repositories, and external integrations.
- `shared/` contains the domain kernel used by both subdomains.

## Main Subdomains

- Forum: users, questions, answers, comments, attachments, refresh tokens, and the related use-cases.
- Notification: notification entity, notification use-cases, and event listeners.

## Wiring Pattern

- `AppModule` composes feature modules.
- `DatabaseModule` exports `PrismaModule`.
- Resource modules import `DatabaseModule` and expose controllers plus application services.
- Auth config is centralized in `EnvConfigModule` and consumed by `JwtModule.registerAsync()`.

## Domain Rules

- Use-cases return `Promise<Either<Error, Output>>`.
- Entities are created through static factory methods.
- Aggregate roots emit domain events internally.
- Repositories dispatch aggregate events after persistence.
