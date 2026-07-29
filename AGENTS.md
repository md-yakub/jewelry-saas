````md
# AGENTS.md

## Purpose

This file defines the general working rules for Codex and other coding agents in this repository.

The project is a full-stack Jewelry SaaS application with:

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- React
- Vite
- Tailwind CSS
- Docker

Follow these instructions for every development task unless the user gives more specific instructions.

---

# 1. Working Style

Work in caveman mode.

- Do not talk much.
- Do not give long explanations before making changes.
- Inspect the code, understand the flow, implement the fix, and verify it.
- Do not stop after analysis.
- Do not ask unnecessary questions when the answer can be found in the repository.
- Do not make assumptions before inspecting the relevant files.
- Prefer working code over theoretical suggestions.
- Keep changes focused.
- Do not modify unrelated files.
- Do not redesign working features unless explicitly requested.
- Preserve existing functionality.
- Follow the repository’s current conventions.
- Do not claim success without verification.

At the end of a task, report only:

1. root cause or implementation summary
2. files changed
3. commands run
4. verification or test result
5. remaining issue, only when one exists

---

# 2. Repository Structure

Expected structure:

```text
jewelry-saas/
├── AGENTS.md
├── architecture/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```
````

Before making changes:

- inspect the project structure
- inspect relevant package scripts
- inspect existing architecture
- inspect existing types and utilities
- reuse existing abstractions where appropriate

Do not create duplicate systems when a working implementation already exists.

---

# 3. General Development Rules

## 3.1 Understand before editing

Before changing code:

- locate the entry point
- trace the complete request or data flow
- identify relevant modules
- inspect existing DTOs, types, services, hooks, guards, and utilities
- identify the actual root cause

For cross-stack features, trace the whole flow:

```text
Frontend UI
→ frontend state/form
→ API client
→ controller
→ DTO validation
→ service
→ Prisma
→ PostgreSQL
→ response
→ frontend state
→ frontend UI
```

Do not patch only one layer when the bug is caused elsewhere.

## 3.2 Keep changes minimal

- Change only what is required.
- Avoid unnecessary refactoring.
- Avoid renaming public APIs unless required.
- Avoid moving files without a clear reason.
- Avoid formatting unrelated files.
- Preserve existing behavior unless the task explicitly changes it.

## 3.3 Reuse existing code

Before creating a new:

- service
- guard
- decorator
- DTO
- hook
- utility
- component
- API client
- pagination type
- error type

search for an existing equivalent.

Extend existing abstractions rather than duplicating them.

## 3.4 Maintain type safety

- Avoid `any`.
- Use explicit interfaces and types.
- Reuse Prisma-generated types where appropriate.
- Keep frontend and backend API types aligned.
- Handle nullable values correctly.
- Do not bypass TypeScript errors with unsafe casts unless absolutely necessary.
- Do not use `@ts-ignore` to hide real problems.

---

# 4. Backend Rules

## 4.1 NestJS architecture

Keep responsibilities separated:

### Controller

Controllers should:

- receive HTTP requests
- use decorators
- validate route inputs through DTOs or pipes
- call services
- return service results

Controllers should not contain:

- complex business logic
- direct Prisma queries
- password hashing logic
- large data transformations

### DTO

DTOs should:

- define incoming request shape
- validate request data
- transform request data when necessary
- document request data in Swagger

DTOs should not:

- query the database
- contain business logic
- call services
- call Prisma

Use DTOs for:

- request bodies
- query parameters
- route parameters when validation is needed
- response contracts when useful

### Service

Services should contain:

- business logic
- Prisma queries
- transaction logic
- authorization-related business checks
- reusable domain operations

Keep service methods focused.

### Module

Modules should:

- register controllers
- register providers
- import required modules
- export providers only when needed elsewhere

Do not make everything global.

---

# 5. Prisma and Database Rules

## 5.1 Prisma usage

Use the existing `PrismaService`.

Do not create a new `PrismaClient` inside normal application services.

Correct:

```ts
constructor(
  private readonly prisma: PrismaService,
) {}
```

Avoid:

```ts
const prisma = new PrismaClient();
```

inside controllers or services.

## 5.2 Schema changes

Before changing `schema.prisma`:

- inspect existing relations
- inspect naming conventions
- inspect migrations
- determine whether the change can be implemented without schema modification

When a schema change is required:

- update the Prisma schema
- create a migration
- regenerate Prisma Client
- update affected code
- verify existing data compatibility

Do not use `prisma db push` as a replacement for proper migrations in normal development unless explicitly requested.

## 5.3 Database safety

Do not:

- reset the database without explicit permission
- delete production-like data
- run destructive migrations silently
- expose hashes or secrets
- write raw SQL when Prisma can safely handle the operation

Use transactions for multi-step operations that must succeed or fail together.

Example:

```ts
await this.prisma.$transaction(async (tx) => {
  // related writes
});
```

## 5.4 Sensitive fields

Never expose:

- `passwordHash`
- `refreshTokenHash`
- secrets
- access tokens stored in the database
- internal security metadata

Use explicit Prisma `select` statements or response mapping where appropriate.

---

# 6. Authentication and Authorization Rules

## 6.1 Authentication

- Normalize emails consistently.
- Verify active-user status.
- Compare passwords using the existing secure hashing library.
- Do not compare plain-text passwords directly.
- Do not weaken bcrypt or argon2 configuration.
- Keep access-token and refresh-token behavior consistent.
- Reject invalid credentials safely.
- Do not leak whether an email exists when avoidable.

## 6.2 Authorization

Authorization must be enforced in the backend.

Frontend route guards are only for user experience.

Do not trust:

- role values from request bodies
- `isSuperAdmin` from the frontend
- user IDs supplied without ownership checks
- shop IDs without membership checks

Keep platform roles and shop roles separate.

Examples:

- Super Admin is platform-level.
- OWNER, MANAGER, STAFF are shop-level.
- A shop owner is not automatically a Super Admin.

Use existing:

- JWT guards
- role guards
- shop-access guards
- current-user decorators

Create a new guard only when the authorization concern is genuinely different.

## 6.3 Public registration

Public registration must never permit privilege escalation.

Do not allow public DTOs to set:

- `isSuperAdmin`
- internal roles
- arbitrary shop ownership
- security flags
- active status unless intended

---

# 7. API Design Rules

## 7.1 Endpoints

Follow current route conventions.

Use correct HTTP methods:

- `GET` for reading
- `POST` for creating
- `PATCH` for partial updates
- `PUT` for full replacement when appropriate
- `DELETE` for deletion

Use consistent status codes.

## 7.2 Validation

All external input must be validated.

Validate:

- body
- query
- route parameters
- enums
- pagination
- UUIDs
- dates
- numeric ranges

Use `class-validator` and `class-transformer` according to existing project conventions.

## 7.3 Error handling

Use NestJS exceptions:

- `BadRequestException`
- `UnauthorizedException`
- `ForbiddenException`
- `NotFoundException`
- `ConflictException`

Do not return raw error objects.

Do not expose:

- stack traces
- SQL errors
- internal implementation details
- secret values

Use the existing global exception filter.

## 7.4 Pagination

Use existing pagination DTOs and response formats.

Do not create a second pagination convention.

Validate reasonable page and limit values.

---

# 8. Swagger Rules

Document all public endpoints.

Use existing project conventions.

Include where appropriate:

- `@ApiTags`
- `@ApiBearerAuth`
- `@ApiOperation`
- `@ApiBody`
- `@ApiParam`
- `@ApiQuery`
- `@ApiOkResponse`
- `@ApiCreatedResponse`
- `@ApiBadRequestResponse`
- `@ApiUnauthorizedResponse`
- `@ApiForbiddenResponse`
- `@ApiNotFoundResponse`

DTO properties should include:

- type
- description
- realistic example
- required or optional status
- enum values when applicable

Do not put endpoint-specific Swagger documentation in `main.ts`.

Do not change runtime behavior only to satisfy Swagger.

---

# 9. Frontend Rules

## 9.1 React components

Components should remain focused.

Separate:

- page composition
- reusable UI
- API logic
- form state
- global auth state
- domain types

Avoid very large components when the project already uses reusable patterns.

## 9.2 Forms

Ensure:

- input names match schema names
- validation schema matches submitted payload
- custom inputs forward refs correctly
- submit buttons use `type="submit"`
- form errors are visible and useful
- server errors are handled separately from local validation errors

Do not duplicate validation unnecessarily.

## 9.3 API client

Use the existing API client.

Do not create direct `fetch` or Axios instances in random components when a central client already exists.

Preserve:

- base URL
- auth headers
- token refresh
- error handling
- interceptors

Do not hard-code backend URLs inside components.

## 9.4 Authentication state

Use the existing store, context, or state-management solution.

Ensure authentication survives:

- page refresh
- access-token refresh
- logout
- expired sessions

Do not infer permissions from:

- route names
- email addresses
- visible UI elements
- local hardcoded lists

## 9.5 Routing

Use the existing router architecture.

For protected routes:

- unauthenticated users go to login
- unauthorized users go to a safe page
- authorized users access the route

Do not rely only on hidden navigation links for access control.

## 9.6 Styling

Use the existing design system and Tailwind conventions.

Do not:

- redesign unrelated pages
- introduce a second component library without need
- add random inline styles when utility classes or components already exist
- change global colors or spacing without a request

Keep mobile and desktop behavior usable.

---

# 10. Security Rules

Never:

- commit `.env` files
- commit real secrets
- log passwords
- log password hashes
- log refresh tokens
- expose internal database fields
- trust client-side authorization
- allow mass assignment of protected fields
- disable validation to make a request pass
- weaken password hashing
- bypass guards for convenience
- hard-code admin emails
- store plain-text passwords
- expose stack traces to users

Check for:

- privilege escalation
- insecure direct object references
- missing shop ownership checks
- missing active-user checks
- unsafe Prisma selections
- token refresh bugs
- public DTOs containing privileged fields

---

# 11. Environment and Configuration Rules

Use `ConfigService` for backend configuration.

Use Vite environment variables for frontend configuration.

Do not hard-code:

- database URLs
- JWT secrets
- API URLs
- admin credentials
- environment-specific ports
- production domains

Update `.env.example` when adding new required environment variables.

Never put real values into `.env.example`.

---

# 12. Docker Rules

Respect the existing Docker setup.

Before changing Docker files, inspect:

- `docker-compose.yml`
- backend Dockerfile
- frontend Dockerfile
- nginx configuration
- environment variable usage
- service names
- exposed ports
- volumes

Do not rename services or containers without a reason.

Do not delete persistent volumes unless explicitly requested.

Keep development and production concerns separate where possible.

---

# 13. Testing Rules

For every meaningful change:

- run relevant tests
- run type checking
- run build commands
- run lint when configured
- add tests for new behavior
- update broken tests caused by intentional changes

Test both success and failure paths.

Typical backend checks:

```bash
npm run build
npm run test
npm run test:e2e
npm run lint
```

Typical frontend checks:

```bash
npm run build
npm run lint
```

Use actual scripts from each `package.json`. Do not invent commands before checking available scripts.

Do not claim tests passed when they were not run.

When tests cannot run, state the exact reason briefly.

---

# 14. Bug-Fixing Workflow

For bug fixes:

1. reproduce or trace the issue
2. identify the actual root cause
3. inspect all affected layers
4. implement the smallest correct fix
5. add or update tests
6. run checks
7. verify no regression in related behavior

Do not treat symptoms only.

For frontend/backend bugs, inspect both sides before deciding where the fault is.

---

# 15. Feature Development Workflow

For new features:

1. inspect existing architecture
2. define backend contract
3. define authorization rules
4. create or update DTOs
5. implement service logic
6. expose controller endpoints
7. document Swagger
8. update frontend API types
9. implement UI and state
10. add route protection
11. add tests
12. run builds and checks

Build vertical slices rather than disconnected unfinished modules.

---

# 16. Code Quality Rules

Prefer:

- clear names
- small functions
- explicit return types where useful
- dependency injection
- reusable domain services
- shared constants and enums
- early returns
- predictable error handling

Avoid:

- deeply nested conditions
- duplicated business logic
- magic strings
- large controllers
- giant React pages
- hidden side effects
- unnecessary abstractions
- premature optimization

Comments should explain why, not restate obvious code.

---

# 17. Git Rules

Do not modify generated or dependency files unless required.

Normally do not edit:

- `node_modules`
- `dist`
- generated Prisma Client
- compiled frontend output
- `*.tsbuildinfo`

Do not commit:

- `.env`
- logs
- build output
- database volumes
- editor-specific files
- temporary files

Keep commits and changes focused on the requested task.

---

# 18. Generated Files

Do not manually edit generated files.

Examples:

- Prisma Client
- `dist`
- Vite build output
- TypeScript build info

Change the source and regenerate instead.

---

# 19. Final Response Format

After completing work, respond briefly using this format:

```text
Root cause / implementation:
- ...

Files changed:
- ...

Commands run:
- ...

Verification:
- ...
```

Include a remaining issue section only when something is still unresolved.

Do not provide a long tutorial unless explicitly requested.

```

```
