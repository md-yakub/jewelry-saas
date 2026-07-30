# AGENTS.md

## General

- Read the existing code before making changes.
- Follow the existing architecture and coding style.
- Reuse existing services, utilities, components, guards, and DTOs whenever possible.
- Do not duplicate functionality.
- Keep changes focused on the requested task.
- Do not modify unrelated code or redesign existing UI unless requested.

## Backend

- Keep NestJS responsibilities separated:
  - Controller → HTTP only
  - Service → business logic
  - DTO → validation only
- Use the existing PrismaService.
- Do not expose sensitive fields such as:
  - passwordHash
  - refreshTokenHash
- Keep authentication and authorization secure.
- Do not trust client-supplied roles or permissions.

## Frontend

- Use the existing routing, state management, API client, and UI components.
- Keep authentication and authorization consistent.
- Do not create duplicate layouts or components.

## Database

- Reuse the existing Prisma schema.
- Do not make destructive schema or data changes unless explicitly requested.
- Use migrations only when schema changes are required.

## Before finishing

- Review every changed file.
- Verify that the implementation is consistent.
- Fix mistakes introduced by your changes.
- Do not ask me to run commands.
- Do not suggest commands unless I explicitly ask.
- If something cannot be verified without running the application, state that clearly instead of guessing.

## Response format

Respond briefly with:

- Summary
- Files changed
- Remaining issues (if any)
