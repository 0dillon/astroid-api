# astroid-api

> NestJS backend — the **intelligence layer** of Astroid, the Financial Operating System for autonomous AI agents on Stellar.

`astroid-api` is the modular monolith that sits between AI agents and the Stellar blockchain. It owns identity, wallets, spending policies, budgets, approval workflows, risk scoring, transaction intelligence, audit history, and the developer surface (API keys, webhooks). Humans define governance here; agents operate strictly within it.

## Highlights

- **Modular monolith** — 16 domain modules under `src/modules`, each self-contained (controller / service / repository / DTOs) and wired through a shared event bus.
- **Typed everywhere** — Zod-validated input, a uniform response envelope `{ success, data, meta, requestId }`, and typed domain events.
- **Async by design** — BullMQ workers (Redis) for transaction execution, risk analysis, webhook delivery, and notifications.
- **Security first** — JWT access/refresh, passkey (WebAuthn) support, Argon2 hashing, role guards, and per-tier rate limiting.
- **Stellar integration** — pluggable client with a fully-featured mock (`STELLAR_USE_MOCK=true`) so the whole API runs with zero on-chain dependencies in development.

## Modules

`agents` · `analytics` · `approvals` · `audit` · `auth` · `budgets` · `developer` (API keys) · `memory` · `notifications` · `organizations` · `policies` · `risk` · `stellar` · `transactions` · `wallets` · `webhooks`

## Tech stack

NestJS 10 · Prisma 5 + PostgreSQL · Redis + BullMQ · Zod · Passport/JWT · `@stellar/stellar-sdk` · Pino · Swagger · Vitest.

## Quick start

```bash
npm install
cp .env.example .env            # then edit secrets (JWT_*, DATABASE_URL, …)

npm run prisma:generate         # generate the Prisma client
npm run prisma:migrate          # apply migrations to your database
npm run db:seed                 # optional: seed reference data

npm run start:dev               # http://localhost:3000
```

- REST API: `http://localhost:3000/api/v1`
- Swagger docs: `http://localhost:3000/docs`

> **No infra handy?** Set `STELLAR_USE_MOCK=true` (the default) to run without a live Stellar node. A local PostgreSQL and Redis are still required — see `.env.example` for every variable.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run start:dev` | Watch-mode dev server |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run prisma:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed the database |

## Data model

17 Prisma models cover the platform's domain: `Organization`, `User`, `Agent`, `Wallet`, `Policy`, `Budget`, `Transaction`, `Proposal`, `Approval`, `AuditLog`, `Notification`, `ApiKey`, `Webhook`, `Session`, `MemoryRecord`, `PasskeyCredential`, and `DomainEvent`. Schema and migrations live in [`prisma/`](prisma).

## Conventions

- **Response envelope** — every endpoint returns `{ success, data, meta, requestId }` via a global interceptor; errors are normalized by a global exception filter.
- **Validation** — request bodies are parsed by a Zod validation pipe; invalid input never reaches a service.
- **Events** — modules communicate through the in-process event bus (`src/events`); the audit module listens and records.

## License

MIT — see [LICENSE](LICENSE). Part of the [Astroid](https://github.com/ASTROIDX556) open-source platform.
