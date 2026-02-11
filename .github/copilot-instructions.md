# GitHub Copilot Instructions

## Project Overview

This is a NodeJS/Express API codebase (part of a monorepo workspace) using TypeScript (ESM). It serves as a shared library of API modules (`@internetderdinge/api`) used by other applications.

## Architecture & Code Organization

- **Pattern**: Modular, feature-based architecture. Each domain entity (Users, Devices, etc.) has its own folder containing:
  - `*.route.ts`: Router definition and OpenAPI/Swagger configuration.
  - `*.controller.ts`: Request parsing and response handling.
  - `*.service.ts`: Business logic and database interactions.
  - `*.model.ts`: Mongoose schema and interface definitions.
  - `*.validation.ts`: Zod schemas for request validation (`body`, `query`, `params`).
  - `*.schemas.ts`: Zod schemas for response objects (OpenAPI definitions).

- **Data Access**: MongoDB with Mongoose.
- **Validation**: Zod (preferred) for both runtime validation and OpenAPI generation. Joi is present but legacy.

## Key Development Patterns

### 1. Route Definitions

Routes are defined declaratively using a `RouteSpec` array and `buildRouterAndDocs`. **Do not** simply write `router.get(...)`.

- Define an array of `RouteSpec` objects.
- Include `method`, `path`, `validate` (middleware), `requestSchema` (validation), `responseSchema` (docs), and `handler`.
- Bind the router at the end of the file: `buildRouterAndDocs(router, routeSpecs, ...)`

```typescript
// Example from users.route.ts
export const userRouteSpecs: RouteSpec[] = [
  {
    method: "post",
    path: "/",
    validate: [auth("manageUsers"), validateBodyOrganization],
    requestSchema: createUserSchema,
    responseSchema: createUserResponseSchema,
    handler: userController.createUser,
    summary: "...",
  },
];
```

### 2. Request Validation

Use the `validateZod` middleware. Define schemas in `*.validation.ts`.

- Export an object matching `{ body: z.object(...), query: ..., params: ... }`.
- Use custom Zod helpers from `../utils/zValidations.js` (e.g., `zObjectId`, `zPagination`).

### 3. Database & Models

- Interfaces: Define `I[Entity]`, `I[Entity]Document` (extends `I[Entity], Document`), and `I[Entity]Model` (extends `Model<I[Entity]Document>`).
- Plugins: Always apply `toJSON` and `paginate` plugins in the schema.
- Reference: `src/users/users.model.ts` is the canonical example.

### 4. Controllers & Async

- Always wrap controller functions with `catchAsync`.
- Do not use `try/catch` blocks inside controllers unless handling specific non-fatal errors; let global error handler catch exceptions.
- Throw `ApiError` for known application errors: `throw new ApiError(httpStatus.NOT_FOUND, 'User not found');`.

## Tech Stack & Libraries

- **Runtime**: Node.js >= 24
- **Framework**: Express v5
- **ORM**: Mongoose
- **Validation**: Zod (with `@asteasolutions/zod-to-openapi`)
- **Main Dependencies**: `http-status`, `winston`, `auth0`, `googleapis`.
- **Testing**: `vitest`.

## Specific Conventions

- **Naming**: camelCase for files and functions.
- **Imports**: Use `.js` extension for local imports (ESM requirement in TypeScript).
- **Environment**: Configuration via `dotenv` and `checkJwt` for Auth0.
