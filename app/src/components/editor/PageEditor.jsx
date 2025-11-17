import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function PageEditor({ content, onUpdate }) {
  const [isEditing, setIsEditing] = useState(true)
  const [body, setBody] = useState(content.body || '')

  const handleSave = () => {
    onUpdate({ body })
    setIsEditing(false)
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsEditing(true)}
          className={isEditing ? 'btn-primary text-sm' : 'btn text-sm'}
        >
          Edit
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className={!isEditing ? 'btn-primary text-sm' : 'btn text-sm'}
        >
          Preview
        </button>
        {isEditing && (
          <button onClick={handleSave} className="btn text-sm">
            Save
          </button>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full min-h-[400px] p-4 rounded border font-mono text-sm"
          style={{
            borderColor: 'var(--color-subtle-dark)',
            background: 'var(--color-bg)',
            color: 'var(--color-ink)',
          }}
          placeholder="Write your content in markdown..."
        />
      ) : (
        <div
          className="prose prose-lg max-w-none p-4 rounded border"
          style={{ borderColor: 'var(--color-subtle-light)' }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {body || '*No content yet*'}
          </ReactMarkdown>
        </div>
      )}

      <div className="mt-4 text-sm" style={{ color: 'var(--color-subtle-dark)' }}>
        <p>💡 Supports Markdown formatting:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li># Heading, ## Subheading</li>
          <li>**bold**, *italic*</li>
          <li>[link](url), ![image](url)</li>
          <li>- Lists, 1. Numbered lists</li>
          <li>`code`, ```code blocks```</li>
        </ul>
      </div>
    </div>
  )
}
