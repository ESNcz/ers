# ERS backend

## Installation

Use `pnpm` package manager to manage dependencies.

Install deps using: `pnpm install`

## Development

1. Copy `.env.example` file to `.env` file and tweak settings.
2. Start `database` using `docker compose up -d database`. It uses `.env` file to set database and it's access.
3. Start any app from `apps/` using `pnpm start:dev <app_name>` or `PORT=4001 pnpm start:dev <app_name>` to change
   listening port.
4. Now API should be accessible on https://localhost:4000, if PORT is not changed.

## Documentation

Documentation is running at `/docs`. Usually `http://localhost:4000/docs`.

## Apps

- api
- documents

Run with `pnpm start:dev <app_name>`



