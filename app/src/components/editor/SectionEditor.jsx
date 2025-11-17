import { useState } from 'react'

const THEMES = [
  { value: 'default', label: 'Default', color: 'var(--color-subtle-light)' },
  { value: 'highlight', label: 'Highlight', color: 'var(--color-highlight)' },
  { value: 'info', label: 'Info', color: 'var(--color-selected)' },
  { value: 'success', label: 'Success', color: 'var(--color-positive-light)' },
]

export default function SectionEditor({ content, onUpdate }) {
  const [body, setBody] = useState(content.body || '')
  const [theme, setTheme] = useState(content.theme || 'default')

  const handleSave = () => {
    onUpdate({ body, theme })
  }

  const currentTheme = THEMES.find(t => t.value === theme) || THEMES[0]

  return (
    <div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Theme</label>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`px-3 py-2 rounded text-sm ${theme === t.value ? 'ring-2' : ''}`}
              style={{
                background: t.color,
                borderColor: 'var(--color-subtle-dark)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Content</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full min-h-[200px] p-4 rounded border"
          style={{
            borderColor: 'var(--color-subtle-dark)',
            background: 'var(--color-bg)',
            color: 'var(--color-ink)',
          }}
          placeholder="Section text..."
        />
      </div>

      <button onClick={handleSave} className="btn-primary">
        Save Section
      </button>

      <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-subtle-dark)' }}>
        <p className="text-sm mb-2 font-medium">Preview:</p>
        <div
          className="p-4 rounded"
          style={{ background: currentTheme.color }}
        >
          {body || <em style={{ color: 'var(--color-subtle-dark)' }}>No content yet</em>}
        </div>
      </div>
    </div>
  )
}
