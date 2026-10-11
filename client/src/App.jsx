import { useEffect, useState } from 'react'
import { createTask, deleteTask, listTasks, toggleTask } from './api.js'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    listTasks()
      .then((rows) => {
        setTasks(rows)
        setStatus('ready')
      })
      .catch((err) => {
        setError(err.message)
        setStatus('error')
      })
  }, [])

  async function handleAdd(event) {
    event.preventDefault()
    const value = title.trim()
    if (!value) return
    try {
      const task = await createTask(value)
      setTasks((current) => [task, ...current])
      setTitle('')
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleToggle(task) {
    try {
      const updated = await toggleTask(task.id, !task.done)
      setTasks((current) => current.map((t) => (t.id === updated.id ? updated : t)))
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(task) {
    try {
      await deleteTask(task.id)
      setTasks((current) => current.filter((t) => t.id !== task.id))
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const remaining = tasks.filter((task) => !task.done).length

  return (
    <main className="page">
      <header className="header">
        <h1>Tasks</h1>
        <p className="subtitle">
          {status === 'ready'
            ? `${remaining} of ${tasks.length} remaining`
            : status === 'error'
              ? 'Could not reach the API'
              : 'Loading…'}
        </p>
      </header>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          className="add-input"
          type="text"
          value={title}
          placeholder="What needs doing?"
          onChange={(event) => setTitle(event.target.value)}
        />
        <button className="add-button" type="submit" disabled={!title.trim()}>
          Add
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? 'task task-done' : 'task'}>
            <label className="task-main">
              <input type="checkbox" checked={task.done} onChange={() => handleToggle(task)} />
              <span className="task-title">{task.title}</span>
            </label>
            <button className="task-delete" type="button" onClick={() => handleDelete(task)}>
              Delete
            </button>
          </li>
        ))}
        {status === 'ready' && tasks.length === 0 ? (
          <li className="empty">No tasks yet — add one above.</li>
        ) : null}
      </ul>
    </main>
  )
}
