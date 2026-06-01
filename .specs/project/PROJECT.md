# Project Vision

Forum Clean DDD NestJS is a reference-quality forum platform built to demonstrate a clean Domain-Driven Design implementation in NestJS.

## Purpose

The project exists to provide a realistic forum API with strong architectural boundaries, testable business rules, and explicit domain modeling.

## Product Scope

- User authentication with JWT access tokens and refresh token rotation
- Question publishing and management
- Answer publishing, editing, deletion, and best-answer selection
- Comments on questions and answers
- File attachments for forum content
- User notifications driven by domain events

## Architectural Goals

- Keep the domain layer framework-free
- Use explicit repository and gateway contracts
- Model business rules with entities, value objects, and domain events
- Express use-case outcomes with Either instead of exceptions
- Keep infrastructure isolated behind adapters

## Non-Goals

- Social features such as voting, reputation, or following
- Real-time collaboration features
- Admin moderation workflows beyond ownership-based permissions
- Search-first discovery or advanced ranking

## Product Principles

- Business rules belong in the domain layer
- Side effects should be triggered from domain events where possible
- Test behavior through use-cases and repositories, not through framework coupling
- Prefer small, explicit abstractions over shared utility layers
