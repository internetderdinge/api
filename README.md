# @wirewire/openiot-api

Shared OpenIoT API modules used by IoT hardware. This package provides prebuilt Express routers and shared middleware/models for OpenIoT-related features.

## Requirements

- Node.js >= 24
- Yarn (workspace dependency management)

## Install (workspace)

From the repo root:

- `yarn install`

## Build

From the repo root:

- `yarn --cwd packages/openiot-api build`

## Lint

From the repo root:

- `yarn --cwd packages/openiot-api lint`

## Usage

This package is ESM (`"type": "module"`). Import the routers and mount them in an Express app:

- `usersRoute`
- `accountsRoute`
- `organizationsRoute`
- `devicesRoute`
- `devicesNotificationsRoute`
- `pdfRoute`
- `tokensRoute`

Example:

- `import { usersRoute } from "@wirewire/openiot-api";`
- `app.use("/users", usersRoute);`

## Source layout

- `src/*`: Routers, middleware, models, validation, utils
- `src/index.ts`: Public exports

## Notes

- This is a private workspace package and is not published publicly.
