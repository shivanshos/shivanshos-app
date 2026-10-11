import express from 'express'
import { query } from './db.js'

const app = express()
app.use(express.json())

const PORT = Number(process.env.PORT ?? 8000)

// Express 4 does not forward errors from async handlers; this keeps a failed
// query from becoming an unhandled rejection.
const wrap = (handler) => (req, res, next) => handler(req, res, next).catch(next)

app.get(
  '/api/health',
  wrap(async (_req, res) => {
    try {
      await query('SELECT 1')
      res.json({ status: 'ok', database: 'up' })
    } catch (err) {
      res.status(503).json({ status: 'error', database: 'down', message: err.message })
    }
  }),
)

app.get(
  '/api/tasks',
  wrap(async (_req, res) => {
    const { rows } = await query(
      'SELECT id, title, done, created_at FROM tasks ORDER BY created_at DESC, id DESC',
    )
    res.json(rows)
  }),
)

app.post(
  '/api/tasks',
  wrap(async (req, res) => {
    const title = String(req.body?.title ?? '').trim()
    if (!title) return res.status(400).json({ error: 'title is required' })
    const { rows } = await query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, done, created_at',
      [title],
    )
    res.status(201).json(rows[0])
  }),
)

app.patch(
  '/api/tasks/:id',
  wrap(async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' })
    const done = Boolean(req.body?.done)
    const { rows } = await query(
      'UPDATE tasks SET done = $2 WHERE id = $1 RETURNING id, title, done, created_at',
      [id, done],
    )
    if (!rows[0]) return res.status(404).json({ error: 'task not found' })
    res.json(rows[0])
  }),
)

app.delete(
  '/api/tasks/:id',
  wrap(async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' })
    await query('DELETE FROM tasks WHERE id = $1', [id])
    res.status(204).end()
  }),
)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'internal error' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`)
})
