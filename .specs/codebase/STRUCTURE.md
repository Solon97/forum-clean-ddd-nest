# Structure

## Top-Level Layout

- `src/domain/forum/` holds the core forum model.
- `src/domain/notification/` holds notification behavior.
- `src/infra/` holds NestJS modules, controllers, adapters, and persistence.
- `src/shared/` holds reusable domain primitives.
- `test/` holds factories, helpers, in-memory repositories, and E2E bootstrap files.

## Infra Resources

- `src/infra/resources/auth/` covers signup, signin, refresh, and signout.
- `src/infra/resources/question/` covers question CRUD and question comments.
- `src/infra/resources/answer/` covers answer CRUD, comments, and best-answer selection.
- `src/infra/resources/attachment/` handles file uploads.

## Domain Surface

- `src/domain/forum/entities/` contains `User`, `Question`, `Answer`, `Comment`, `Attachment`, and `RefreshToken`.
- `src/domain/forum/use-cases/` contains the forum application behavior.
- `src/domain/notification/` contains notification entities, listeners, repositories, and use-cases.
