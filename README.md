# shivanshos-app

A small full-stack task list: a React (Vite) frontend, an Express API, and PostgreSQL.

- `client/` — React + Vite dev server, published on port **3000**
- `server/` — Express API on port 8000 (Postgres via `pg`)
- `server/db/init.sql` — schema and seed rows, loaded on the database's first boot

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Then open <http://localhost:3000>. The frontend calls the API through Vite's `/api` proxy
(single origin), so the API port is not published directly.

```bash
docker compose -f docker-compose.base44.yml ps        # service health
docker compose -f docker-compose.base44.yml logs -f web api
curl -s http://localhost:3000/api/health              # {"status":"ok","database":"up"}
```

Code is bind-mounted and runs with live reload (`vite`, `node --watch`), so edits under
`client/` or `server/` apply without rebuilding. See [AGENTS.md](./AGENTS.md) for details,
including how to regenerate a lockfile after changing dependencies.

## API

| Method | Path             | Purpose            |
| ------ | ---------------- | ------------------ |
| GET    | `/api/health`    | Health + DB check  |
| GET    | `/api/tasks`     | List tasks         |
| POST   | `/api/tasks`     | Create a task      |
| PATCH  | `/api/tasks/:id` | Toggle `done`      |
| DELETE | `/api/tasks/:id` | Delete a task      |

## Deployment

No deployment pipeline is configured in this repository — the compose file above is a
development stack. Add a production Dockerfile/compose (or your host's build config) before
deploying.
