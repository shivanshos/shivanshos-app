# AGENTS.md

Notes for agents working in this repo. Keep this file to non-obvious findings.

## Running the app (Base44 sandbox)

```bash
docker compose -f docker-compose.base44.yml up -d --build
curl -s http://localhost:3000/            # preview entry point (must answer 200)
curl -s http://localhost:3000/api/health  # -> {"status":"ok","database":"up"}
docker compose -f docker-compose.base44.yml logs -f web api
```

Everything runs from the cloned source with live reload, so edits to `client/` and
`server/` do not need an image rebuild:

- `web`  — Vite dev server on container port 5173, published as host **3000**. This is
  the port the Base44 preview watches.
- `api`  — Express API on internal port 8000 (`node --watch src/index.js`).
- `db`   — PostgreSQL 16.

### Things that are easy to get wrong

- **Single origin, on purpose.** The API is *not* published to a host port. The browser
  talks only to port 3000 and Vite proxies `/api` to `http://api:8000`
  (`client/vite.config.js`). Keep client API calls relative (`/api/...`) — switching to an
  absolute URL would introduce CORS/credentials problems the proxy avoids.
- **Host allowlist.** The preview proxy reaches Vite with
  `Host: <port>-<sandbox id>.$BASE44_SANDBOX_HOST_DOMAIN` (the sandbox id rotates). Vite
  blocks unknown hosts, so `vite.config.js` appends `.${BASE44_SANDBOX_HOST_DOMAIN}` to
  `server.allowedHosts` **only when `BASE44_PREVIEW_MODE === '1'`**; with the flag unset
  the allowlist is Vite's normal dev default. Nothing is hardcoded — the values come from
  compose `environment:` at runtime.
- **Dependencies.** `node_modules` is a named volume per service, populated by
  `npm ci` at container start from the committed `package-lock.json`. If you change a
  `package.json`, regenerate the lockfile (see below) — `npm ci` fails on a mismatch and
  the service will not start.
- **Schema.** `server/db/init.sql` is mounted into the postgres image's
  `/docker-entrypoint-initdb.d`, so it runs **only once, on an empty data volume**. Editing
  it does nothing on an existing database — apply changes with `psql`/a migration, or
  recreate the `db_data` volume (which deletes data).

### Regenerating a lockfile (no Node on the sandbox host)

```bash
docker run --rm -v "$PWD/client":/w -w /w node:22 npm install --package-lock-only
docker run --rm -v "$PWD/server":/w -w /w node:22 npm install --package-lock-only
```

## Verifying the app works

1. `docker compose -f docker-compose.base44.yml ps` — all services `healthy`.
2. `curl -s http://localhost:3000/api/tasks` — returns the seeded rows (proves the API and
   Postgres are wired through the proxy).
3. In the preview: add a task, reload, and confirm it is still there; toggle and delete it.
   The write path goes UI → Vite proxy → Express → Postgres.

Confirm the dev server is serving **source**, not a prebuilt bundle: `/@vite/client` and
`/src/main.jsx` should return 200 and `index.html` should reference `/src/main.jsx`.

## Secrets

This app needs no external-service credentials. The Postgres user/password in
`docker-compose.base44.yml` are local infrastructure credentials generated for the sandbox,
not user secrets. `.base44/environment.json` has an empty `secrets` list; if an external
integration is added later, deliver it via `/run/base44/app.env` rather than `environment:`.
