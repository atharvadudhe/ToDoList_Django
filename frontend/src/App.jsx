import { useEffect, useState } from 'react'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
})

export default function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await api.get('/tasks/')
    setTasks(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addTask = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const { data } = await api.post('/tasks/', { title, completed: false })
    setTasks(prev => [data, ...prev])
    setTitle('')
  }

  const toggle = async (task) => {
    const { data } = await api.patch(`/tasks/${task.id}/`, { completed: !task.completed })
    setTasks(prev => prev.map(t => t.id === task.id ? data : t))
  }

  const updateTitle = async (task, newTitle) => {
    const { data } = await api.patch(`/tasks/${task.id}/`, { title: newTitle })
    setTasks(prev => prev.map(t => t.id === task.id ? data : t))
  }

  const remove = async (task) => {
    await api.delete(`/tasks/${task.id}/`)
    setTasks(prev => prev.filter(t => t.id !== task.id))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
      <div className="w-full max-w-xl border border-black rounded p-6 bg-white">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold">TODO LIST</h1>
          <p className="text-sm text-gray-600">Django + React + Tailwind</p>
        </header>

        <form onSubmit={addTask} className="flex gap-2 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New task..."
            className="flex-1 border border-black rounded px-2 py-1 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-1 border border-black rounded text-white hover:bg-white hover:text-blue"
          >
            Add
          </button>
        </form>

        {loading ? (
          <p className="italic">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="italic">No tasks yet</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => toggle(task)}
                onDelete={() => remove(task)}
                onRename={(name) => updateTitle(task, name)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete, onRename }) {
  const [editing, setEditing] = useState(false)
  const [txt, setTxt] = useState(task.title)

  const save = async () => {
    if (txt.trim() && txt !== task.title) await onRename(txt.trim())
    setEditing(false)
  }

  return (
    <li className="border border-black rounded p-2 flex items-center gap-2">
      <button
        onClick={onToggle}
        className={`w-10 h-10 border border-black text-center ${task.completed ? 'bg-black text-white' : ''}`}
        title="toggle complete"
      >
        {task.completed ? '✓' : ''}
      </button>

      {editing ? (
        <input
          className="flex-1 border border-black rounded px-2 py-1"
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          autoFocus
        />
      ) : (
        <span
          className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}
          onDoubleClick={() => setEditing(true)}
        >
          {task.title}
        </span>
      )}

      <button
        onClick={() => setEditing(v => !v)}
        className="px-2 py-1 border border-black rounded hover:bg-black hover:text-white text-white"
      >
        {editing ? 'Save' : 'Edit'}
      </button>

      <button
        onClick={onDelete}
        className="px-2 py-1 border border-black rounded hover:bg-black hover:text-white text-white"
      >
        Del
      </button>
    </li>
  )
}
