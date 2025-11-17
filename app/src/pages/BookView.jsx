import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import BookContent from '../components/books/BookContent'
import Comments from '../components/comments/Comments'
import { Share2 } from 'lucide-react'

export default function BookView() {
  const { bookId } = useParams()
  const { user } = useAuth()
  const [book, setBook] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showShareDialog, setShowShareDialog] = useState(false)

  useEffect(() => {
    loadBookAndLeaves()
  }, [bookId])

  const loadBookAndLeaves = async () => {
    try {
      const bookDoc = await getDoc(doc(db, 'books', bookId))
      if (!bookDoc.exists()) {
        console.error('Book not found')
        return
      }
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

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Book not found</p>
          <Link to="/" className="btn">Go Home</Link>
        </div>
      </div>
    )
  }

  const isOwner = user && book.userId === user.uid

  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-4" style={{ borderColor: 'var(--color-subtle-dark)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="text-sm" style={{ color: 'var(--color-link)' }}>
              ← Home
            </Link>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="btn text-sm flex items-center gap-2"
              >
                <Share2 size={16} />
                Share
              </button>
              {isOwner && (
                <Link to={`/book/${bookId}/edit`} className="btn-primary text-sm">
                  Edit
                </Link>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          {book.subtitle && (
            <p className="text-lg mb-2" style={{ color: 'var(--color-subtle-dark)' }}>
              {book.subtitle}
            </p>
          )}
          <p className="text-sm" style={{ color: 'var(--color-subtle-dark)' }}>
            by {book.author}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <BookContent leaves={leaves} />

        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--color-subtle-dark)' }}>
          <h2 className="text-2xl font-bold mb-6">Comments</h2>
          <Comments bookId={bookId} />
        </div>
      </main>
    </div>
  )
}
