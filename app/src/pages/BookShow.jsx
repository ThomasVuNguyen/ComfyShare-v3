import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'
import TOCGrid from '../components/books/TOCGrid'
import { generatePositionScore } from '../lib/utils'

export default function BookShow() {
  const { bookId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [arrangeMode, setArrangeMode] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBook()
  }, [bookId])

  const loadBook = async () => {
    try {
      const bookDoc = await getDoc(doc(db, 'books', bookId))
      if (!bookDoc.exists()) return

      const bookData = { id: bookDoc.id, ...bookDoc.data() }
      setBook(bookData)

      const q = query(
        collection(db, 'leaves'),
        where('bookId', '==', bookId),
        where('status', '==', 'active'),
        orderBy('positionScore', 'asc')
      )
      const snapshot = await getDocs(q)
      const leavesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setLeaves(leavesData)
    } catch (error) {
      console.error('Error loading book:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLeaf = async (type) => {
    if (!user || book.userId !== user.uid) return

    try {
      const lastLeaf = leaves[leaves.length - 1]
      const positionScore = generatePositionScore(lastLeaf?.positionScore || 0)
      const timestamp = new Date().toISOString()

      // Create leafable content
      let leafableId
      if (type === 'page') {
        const pageDoc = await addDoc(collection(db, 'pages'), {
          body: '',
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        leafableId = pageDoc.id
      } else if (type === 'section') {
        const sectionDoc = await addDoc(collection(db, 'sections'), {
          body: '',
          theme: 'default',
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        leafableId = sectionDoc.id
      } else if (type === 'picture') {
        const pictureDoc = await addDoc(collection(db, 'pictures'), {
          caption: '',
          imageUrl: '',
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        leafableId = pictureDoc.id
      }

      // Create leaf
      const leafDoc = await addDoc(collection(db, 'leaves'), {
        bookId,
        leafableType: type,
        leafableId,
        title: type === 'page' ? 'New Page' : type === 'section' ? 'New Section' : 'New Picture',
        positionScore,
        status: 'active',
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      navigate(`/book/${bookId}/leaf/${leafDoc.id}/edit`)
    } catch (error) {
      console.error('Error adding leaf:', error)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex align-center justify-center" style={{ minHeight: '50vh' }}>
          <p>Loading...</p>
        </div>
      </AppLayout>
    )
  }

  if (!book) {
    return (
      <AppLayout>
        <div className="flex align-center justify-center" style={{ minHeight: '50vh' }}>
          <p>Book not found</p>
        </div>
      </AppLayout>
    )
  }

  const isOwner = user && book.userId === user.uid

  const header = (
    <nav className="book__navbar">
      <Link to="/" className="btn">
        <img src="/images/arrow-left.svg" width="24" alt="Back" />
      </Link>

      <span className="btn btn--placeholder placeholder-start"></span>

      <div className="breadcrumbs">
        <Link to="/">Library</Link>
        <span> ▸ </span>
        <strong>{book.title}</strong>
      </div>

      {isOwner && (
        <Link to={`/book/${bookId}/edit`} className="btn settings">
          <img src="/images/settings.svg" width="24" alt="Settings" />
        </Link>
      )}

      <span className="btn btn--placeholder placeholder-end"></span>

      <button className="btn fullscreen">
        <img src="/images/expand.svg" width="24" alt="Fullscreen" />
      </button>
    </nav>
  )

  return (
    <AppLayout header={header}>
      <div className="book">
        {/* Book sidebar with cover */}
        <aside className="txt-align-center margin-block">
          <div className="book__sidebar">
            <span className="book__cover-wrapper">
              {book.coverUrl ? (
                <img src={book.coverUrl} className="book__cover margin-block-none center" alt="" />
              ) : (
                <>
                  <img src="/images/empty-cover.png" className="book__cover" alt="" />
                  <span className="book__title overflow-line-clamp" style={{ '--lines': 6 }}>
                    {book.title}
                  </span>
                </>
              )}
            </span>
          </div>
        </aside>

        {/* Main content: Title & TOC */}
        <div className="arrangement__container toc__container full-width">
          <h1 className="flex flex-column txt-tight-lines">
            <strong className="book__title txt-x-large--responsive">{book.title}</strong>
            {book.subtitle && (
              <span className="txt-large--responsive txt-normal">{book.subtitle}</span>
            )}
            <span className="txt-large--responsive txt-normal">{book.author}</span>
          </h1>

          {/* Toolbar */}
          <div className="book__toolbar fill-white flex gap-half pad-block position-sticky">
            {/* View toggle */}
            <label className="btn txt-medium">
              <input
                type="radio"
                name="view"
                id="toc-list"
                checked={viewMode === 'list'}
                onChange={() => setViewMode('list')}
              />
              <img src="/images/view-list.svg" width="24" alt="List view" />
            </label>

            <label className="btn txt-medium">
              <input
                type="radio"
                name="view"
                id="toc-grid"
                checked={viewMode === 'grid'}
                onChange={() => setViewMode('grid')}
              />
              <img src="/images/view-grid.svg" width="24" alt="Grid view" />
            </label>

            {isOwner && (
              <>
                <button className="btn txt-medium" onClick={() => handleAddLeaf('page')}>
                  + Page
                </button>
                <button className="btn txt-medium" onClick={() => handleAddLeaf('picture')}>
                  + Picture
                </button>
                <button className="btn txt-medium" onClick={() => handleAddLeaf('section')}>
                  + Section
                </button>

                <label className="btn arrange-mode__button">
                  <input
                    type="checkbox"
                    id="arrange-mode"
                    checked={arrangeMode}
                    onChange={(e) => setArrangeMode(e.target.checked)}
                  />
                  <img src="/images/handle.svg" width="24" alt="Arrange" />
                </label>

                <label className="btn delete-mode__button">
                  <input
                    type="checkbox"
                    id="delete-mode"
                    checked={deleteMode}
                    onChange={(e) => setDeleteMode(e.target.checked)}
                  />
                  <img src="/images/minus.svg" width="24" alt="Delete" />
                </label>
              </>
            )}
          </div>

          {/* Blank slate or TOC */}
          {leaves.length === 0 ? (
            <div className="toc__blank-slate">
              <img src="/images/blank-slate-arrows.svg" width="60" alt="" />
              <span>Pick a page type to get started</span>
            </div>
          ) : (
            <TOCGrid
              bookId={bookId}
              leaves={leaves}
              viewMode={viewMode}
              editMode={isOwner}
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
