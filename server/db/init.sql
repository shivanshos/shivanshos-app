-- Loaded by the postgres image only when its data volume is empty
-- (see docker-compose.base44.yml and AGENTS.md).

CREATE TABLE IF NOT EXISTS tasks (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  done       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO tasks (title, done) VALUES
  ('Scaffolded the Base44 dev environment', TRUE),
  ('Add your first task', FALSE);
