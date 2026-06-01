# Conventions

## Layer Boundaries

- Domain code does not import from `infra/`.
- HTTP controllers call application services; they do not contain business rules.
- Prisma is isolated behind repository implementations.

## Error Handling

- Use-cases return `Either` instead of throwing for domain failures.
- Controllers and HTTP services map left values to HTTP responses through `handle-use-case-error`.

## Entity and Value Object Usage

- Create entities via static factories, not direct constructor calls.
- Use `WatchedList` for attachment collections that need change tracking.
- Use `UniqueEntityId` and `Slug` value objects where the domain model expects them.

## HTTP Boundary

- Validation is done with Zod pipes.
- Authenticated user data is injected with `@CurrentUser()`.
- Public routes are explicitly marked with `@Public()`.
