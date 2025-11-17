import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

function LeafThumbnail({ leaf }) {
  const [content, setContent] = useState(null)

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
    }
  }

  if (!content) return <div className="toc__thumbnail">Loading...</div>

  // Section thumbnail
  if (leaf.leafableType === 'section') {
    const isDark = content.theme === 'dark'
    return (
      <div className={`toc__thumbnail txt-align-center ${isDark ? 'toc__thumbnail--dark' : ''}`}>
        <span>{leaf.title}</span>
      </div>
    )
  }

  // Picture thumbnail
  if (leaf.leafableType === 'picture') {
    return (
      <div className="toc__thumbnail">
        {content.imageUrl && (
          <img src={content.imageUrl} alt={content.caption} />
        )}
      </div>
    )
  }

  // Page thumbnail (HTML preview)
  return (
    <div className="toc__thumbnail">
      <div dangerouslySetInnerHTML={{ __html: content.body?.substring(0, 200) || '' }} />
    </div>
  )
}

export default function TOCGrid({ bookId, leaves, viewMode = 'grid', editMode = false }) {
  return (
    <menu className="toc margin-none" tabindex="0">
      {leaves.map((leaf) => (
        <li
          key={leaf.id}
          className={`toc__leaf toc__leaf--${leaf.leafableType} arrangement__item`}
          data-leaf-id={leaf.id}
        >
          {/* Arrange handle (shown in arrange mode) */}
          <span className="btn btn--link arrangement__handle txt-small">
            <img src="/images/handle.svg" width="24" alt="" />
          </span>

          {/* Delete button (shown in delete mode) */}
          <button className="btn btn--negative txt-small leaf__delete">
            <img src="/images/minus.svg" width="24" alt="" />
          </button>

          {/* Thumbnail */}
          <LeafThumbnail leaf={leaf} />

          {/* Title */}
          <Link
            to={editMode ? `/book/${bookId}/leaf/${leaf.id}/edit` : `/book/${bookId}/leaf/${leaf.id}`}
            className={`toc__title min-width ${editMode ? 'hide_from_reading_mode' : 'hide_from_edit_mode'}`}
          >
            <span className="overflow-ellipsis">{leaf.title}</span>
          </Link>

          {/* Word count (pages only) */}
          {leaf.leafableType === 'page' && (
            <small className="toc__wordcount txt-small--responsive">
              {/* TODO: Calculate word count */}
              0 words
            </small>
          )}
        </li>
      ))}
    </menu>
  )
}
