const BASE = '/api'

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const message = await res.text().catch(() => '')
    throw new Error(message || `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}

export const listTasks = () => request('/tasks')

export const createTask = (title) =>
  request('/tasks', { method: 'POST', body: JSON.stringify({ title }) })

export const toggleTask = (id, done) =>
  request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) })

export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' })
