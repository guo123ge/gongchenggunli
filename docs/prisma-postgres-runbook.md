# Prisma/PostgreSQL runbook

The app runs with `DATA_BACKEND=json` by default so the MVP can be used without
an external database. Use this runbook when PostgreSQL or Docker is available
and you want to verify the Prisma backend.

## Local Docker path

```powershell
docker compose up -d postgres
npm.cmd run db:prepare
```

`db:prepare` runs these steps in order:

```powershell
npx.cmd prisma generate
npx.cmd prisma migrate deploy
npm.cmd run db:seed
npm.cmd run verify:prisma
```

After `verify:prisma` succeeds, switch `.env.local` to:

```env
DATA_BACKEND="prisma"
```

Then restart the Next.js server.

## Current machine status

On this workstation, the Prisma code path is ready but the external service is
not available yet:

```text
docker: command not found
psql: command not found
pg_ctl: command not found
localhost:5432: connection failed
```

Because of that, `npm.cmd run verify:prisma` is expected to return
`POSTGRES_UNAVAILABLE` until PostgreSQL is installed or started.
