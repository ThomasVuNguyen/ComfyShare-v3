import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import PageEditor from './PageEditor'
import SectionEditor from './SectionEditor'
import PictureEditor from './PictureEditor'

export default function LeafEditor({ leaf, onUpdateLeaf, onDeleteLeaf }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [leaf])

  const loadContent = async () => {
    setLoading(true)
    try {
      const contentDoc = await getDoc(doc(db, `${leaf.leafableType}s`, leaf.leafableId))
      if (contentDoc.exists()) {
        setContent({ id: contentDoc.id, ...contentDoc.data() })
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateContent = async (updates) => {
    try {
      await updateDoc(doc(db, `${leaf.leafableType}s`, leaf.leafableId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      setContent({ ...content, ...updates })
    } catch (error) {
      console.error('Error updating content:', error)
    }
  }

  const handleUpdateLeafTitle = async (title) => {
    await onUpdateLeaf(leaf.id, { title })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Content not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <input
          type="text"
          value={leaf.title}
          onChange={(e) => handleUpdateLeafTitle(e.target.value)}
          className="text-2xl font-bold w-full border-none outline-none bg-transparent"
          placeholder="Title"
          style={{ color: 'var(--color-ink)' }}
        />
      </div>

      {leaf.leafableType === 'page' && (
        <PageEditor content={content} onUpdate={handleUpdateContent} />
      )}

      {leaf.leafableType === 'section' && (
        <SectionEditor content={content} onUpdate={handleUpdateContent} />
      )}

      {leaf.leafableType === 'picture' && (
        <PictureEditor content={content} onUpdate={handleUpdateContent} />
      )}

      <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-subtle-dark)' }}>
        <button
          onClick={() => onDeleteLeaf(leaf.id)}
          className="text-sm"
          style={{ color: 'var(--color-negative)' }}
        >
          Delete this {leaf.leafableType}
        </button>
      </div>
    </div>
  )
}
