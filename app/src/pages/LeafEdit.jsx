import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function LeafEdit() {
  const { bookId, leafId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [leaf, setLeaf] = useState(null)
  const [content, setContent] = useState(null)
  const [editMode, setEditMode] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [leafId])

  const loadData = async () => {
    try {
      // Load book
      const bookDoc = await getDoc(doc(db, 'books', bookId))
      if (!bookDoc.exists() || bookDoc.data().userId !== user.uid) {
        navigate('/')
        return
      }
      setBook({ id: bookDoc.id, ...bookDoc.data() })

      // Load leaf
      const leafDoc = await getDoc(doc(db, 'leaves', leafId))
      if (!leafDoc.exists()) {
        navigate(`/book/${bookId}`)
        return
      }
      const leafData = { id: leafDoc.id, ...leafDoc.data() }
      setLeaf(leafData)

      // Load content
      const contentDoc = await getDoc(doc(db, `${leafData.leafableType}s`, leafData.leafableId))
      if (contentDoc.exists()) {
        setContent(contentDoc.data())
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!leaf || !content) return

    setSaving(true)
    try {
      await updateDoc(doc(db, `${leaf.leafableType}s`, leaf.leafableId), {
        ...content,
        updatedAt: new Date().toISOString(),
      })

      await updateDoc(doc(db, 'leaves', leafId), {
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this item?')) return

    try {
      await updateDoc(doc(db, 'leaves', leafId), {
        status: 'trashed',
        updatedAt: new Date().toISOString(),
      })
      navigate(`/book/${bookId}`)
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  if (loading) {
    return <AppLayout><p>Loading...</p></AppLayout>
  }

  if (!leaf || !content) {
    return <AppLayout><p>Not found</p></AppLayout>
  }

  const header = (
    <nav>
      <Link to={`/book/${bookId}`} className="btn">
        <img src="/images/arrow-left.svg" width="24" alt="Back" />
      </Link>

      <div className="breadcrumbs">
        <Link to="/">Library</Link>
        <span> ▸ </span>
        <Link to={`/book/${bookId}`}>{book?.title}</Link>
        <span> ▸ </span>
        <input
          type="text"
          value={leaf.title}
          onChange={async (e) => {
            const newTitle = e.target.value
            setLeaf({ ...leaf, title: newTitle })
            await updateDoc(doc(db, 'leaves', leafId), { title: newTitle })
          }}
          className="input"
        />
      </div>

      <button className="btn fullscreen">
        <img src="/images/expand.svg" width="24" alt="Fullscreen" />
      </button>
    </nav>
  )

  const toolbar = (
    <div className="page-toolbar fill-selected align-center gap-half margin-block-end-double">
      {/* Edit/Read toggle */}
      <label className="btn txt-small">
        <input
          type="checkbox"
          className="switch__input"
          checked={editMode}
          onChange={(e) => setEditMode(e.target.checked)}
        />
        <img src="/images/book.svg" width="24" alt="Toggle mode" />
      </label>

      <span className="separator margin-inline-half"></span>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        className="btn page-toolbar__save txt-small"
        disabled={saving}
      >
        <img src="/images/check.svg" width="24" alt="Save" />
      </button>
    </div>
  )

  // Page Editor
  if (leaf.leafableType === 'page') {
    return (
      <AppLayout header={header} toolbar={toolbar}>
        <article className="layout--reading">
          {editMode ? (
            <textarea
              value={content.body || ''}
              onChange={(e) => setContent({ ...content, body: e.target.value })}
              className="input full-width"
              style={{ minHeight: '60vh', fontFamily: 'var(--font-mono)' }}
              placeholder="Write in markdown..."
            />
          ) : (
            <div className="page--page prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content.body || ''}
              </ReactMarkdown>
            </div>
          )}

          <footer className="margin-block-double">
            <button onClick={handleDelete} className="btn btn--negative txt-small">
              <img src="/images/minus.svg" width="24" alt="" />
              Delete
            </button>
          </footer>
        </article>
      </AppLayout>
    )
  }

  // Section Editor
  if (leaf.leafableType === 'section') {
    const isDark = content.theme === 'dark'

    return (
      <AppLayout header={header} toolbar={toolbar}>
        <div className={`page--section ${isDark ? 'theme--dark' : ''}`} style={{ minHeight: '60vh' }}>
          <div className="flex flex-column gap align-center">
            {/* Theme toggle */}
            <div className="flex gap">
              <label className="btn">
                <input
                  type="radio"
                  name="section_theme"
                  value="light"
                  checked={content.theme !== 'dark'}
                  onChange={() => setContent({ ...content, theme: 'light' })}
                />
                Light
              </label>
              <label className="btn">
                <input
                  type="radio"
                  name="section_theme"
                  value="dark"
                  checked={content.theme === 'dark'}
                  onChange={() => setContent({ ...content, theme: 'dark' })}
                />
                Dark
              </label>
            </div>

            {/* Title */}
            <h1 className="txt-align-center">
              <textarea
                value={content.body || ''}
                onChange={(e) => setContent({ ...content, body: e.target.value })}
                className="input input--textarea full-width txt-align-center"
                placeholder="Section title..."
              />
            </h1>
          </div>

          <footer className="margin-block-double txt-align-center">
            <button onClick={handleDelete} className="btn btn--negative txt-small">
              <img src="/images/minus.svg" width="24" alt="" />
              Delete
            </button>
          </footer>
        </div>
      </AppLayout>
    )
  }

  // Picture Editor
  if (leaf.leafableType === 'picture') {
    const handleImageUpload = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        const storageRef = ref(storage, `pictures/${Date.now()}_${file.name}`)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        setContent({ ...content, imageUrl: url })
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }

    return (
      <AppLayout header={header} toolbar={toolbar}>
        <div className="page--picture picture-form margin-none">
          {/* Image upload */}
          <label className="input input--file input--picture unpad">
            {content.imageUrl ? (
              <img src={content.imageUrl} alt={content.caption} />
            ) : (
              <img src="/images/default-picture.webp" alt="Upload" />
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>

          {/* Caption */}
          <div className="flex align-center gap margin-block">
            <input
              type="text"
              value={content.caption || ''}
              onChange={(e) => setContent({ ...content, caption: e.target.value })}
              className="input"
              placeholder="Picture caption..."
            />
          </div>

          <footer className="margin-block-double txt-align-center">
            <button onClick={handleDelete} className="btn btn--negative txt-small">
              <img src="/images/minus.svg" width="24" alt="" />
              Delete
            </button>
          </footer>
        </div>
      </AppLayout>
    )
  }

  return <AppLayout><p>Unknown type</p></AppLayout>
}
