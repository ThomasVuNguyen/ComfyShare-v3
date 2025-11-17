import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Comments from '../components/comments/Comments'

export default function LeafView() {
  const { bookId, leafId } = useParams()
  const { user } = useAuth()
  const [book, setBook] = useState(null)
  const [leaf, setLeaf] = useState(null)
  const [content, setContent] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [leafId])

  const loadData = async () => {
    try {
      // Load book
      const bookDoc = await getDoc(doc(db, 'books', bookId))
      if (!bookDoc.exists()) return
      const bookData = { id: bookDoc.id, ...bookDoc.data() }
      setBook(bookData)

      // Load all leaves for navigation
      const q = query(
        collection(db, 'leaves'),
        where('bookId', '==', bookId),
        where('status', '==', 'active'),
        orderBy('positionScore', 'asc')
      )
      const snapshot = await getDocs(q)
      const leavesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setLeaves(leavesData)

      // Load current leaf
      const leafDoc = await getDoc(doc(db, 'leaves', leafId))
      if (!leafDoc.exists()) return
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

  if (loading) {
    return <AppLayout><p>Loading...</p></AppLayout>
  }

  if (!leaf || !content) {
    return <AppLayout><p>Not found</p></AppLayout>
  }

  const currentIndex = leaves.findIndex(l => l.id === leafId)
  const nextLeaf = currentIndex < leaves.length - 1 ? leaves[currentIndex + 1] : null
  const isOwner = user && book?.userId === user.uid

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
        <strong>{leaf.title}</strong>
      </div>

      {isOwner && (
        <Link to={`/book/${bookId}/leaf/${leafId}/edit`} className="btn">
          <img src="/images/write.svg" width="24" alt="Edit" />
        </Link>
      )}

      <button className="btn fullscreen">
        <img src="/images/expand.svg" width="24" alt="Fullscreen" />
      </button>
    </nav>
  )

  const footer = nextLeaf ? (
    <footer>
      <nav className="book__nav flex align-center gap justify-center">
        <Link to={`/book/${bookId}/leaf/${nextLeaf.id}`} className="btn">
          Next <img src="/images/arrow-right.svg" width="24" alt="" />
        </Link>
      </nav>
    </footer>
  ) : null

  return (
    <AppLayout header={header} footer={footer}>
      {/* Page */}
      {leaf.leafableType === 'page' && (
        <div className="page--page">
          <article className="prose prose-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content.body || ''}
            </ReactMarkdown>
          </article>
        </div>
      )}

      {/* Section */}
      {leaf.leafableType === 'section' && (
        <div className={`page--section ${content.theme === 'dark' ? 'theme--dark' : ''}`}>
          <h1 className="txt-align-center">{content.body}</h1>
        </div>
      )}

      {/* Picture */}
      {leaf.leafableType === 'picture' && (
        <figure className="page--picture flex flex-column align-center gap margin-none">
          {content.imageUrl && (
            <a href={content.imageUrl} data-lightbox>
              <img src={content.imageUrl} alt={content.caption} />
            </a>
          )}
          {content.caption && <figcaption>{content.caption}</figcaption>}
        </figure>
      )}

      {/* Comments */}
      <div className="margin-block-double">
        <h2 className="txt-large">Comments</h2>
        <Comments bookId={bookId} leafId={leafId} />
      </div>
    </AppLayout>
  )
}
