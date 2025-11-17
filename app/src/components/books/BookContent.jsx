import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function LeafContent({ leaf }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [leaf])

  const loadContent = async () => {
    try {
      const contentDoc = await getDoc(doc(db, `${leaf.leafableType}s`, leaf.leafableId))
      if (contentDoc.exists()) {
        setContent(contentDoc.data())
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="py-4">Loading...</div>

  if (!content) return null

  if (leaf.leafableType === 'page') {
    return (
      <div className="prose prose-lg max-w-none mb-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content.body || ''}
        </ReactMarkdown>
      </div>
    )
  }

  if (leaf.leafableType === 'section') {
    const themeColors = {
      default: 'var(--color-subtle-light)',
      highlight: 'var(--color-highlight)',
      info: 'var(--color-selected)',
      success: 'var(--color-positive-light)',
    }

    return (
      <div
        className="p-6 rounded mb-8"
        style={{ background: themeColors[content.theme] || themeColors.default }}
      >
        <h3 className="text-xl font-bold mb-2">{leaf.title}</h3>
        <p>{content.body}</p>
      </div>
    )
  }

  if (leaf.leafableType === 'picture') {
    return (
      <div className="mb-8">
        {content.imageUrl && (
          <img
            src={content.imageUrl}
            alt={content.caption}
            className="w-full rounded"
          />
        )}
        {content.caption && (
          <p className="mt-2 text-sm text-center" style={{ color: 'var(--color-subtle-dark)' }}>
            {content.caption}
          </p>
        )}
      </div>
    )
  }

  return null
}

export default function BookContent({ leaves }) {
  if (leaves.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-subtle-dark)' }}>
          This book doesn't have any content yet.
        </p>
      </div>
    )
  }

  return (
    <div>
      {leaves.map((leaf) => (
        <div key={leaf.id}>
          <LeafContent leaf={leaf} />
        </div>
      ))}
    </div>
  )
}
