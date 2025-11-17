import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'

export default function Library() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadBooks()
  }, [user])

  const loadBooks = async () => {
    try {
      const q = query(
        collection(db, 'books'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const booksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setBooks(booksData)
    } catch (error) {
      console.error('Error loading books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const header = (
    <nav>
      <span className="btn btn--placeholder"></span>

      <a href="https://github.com/yourusername/comfyshare" className="product__wordmark btn btn--plain txt-large center">
        <img src="/images/books.svg" width="24" alt="" />
        <span>ComfyShare</span>
      </a>

      <button onClick={handleLogout} className="btn">
        <img src="/images/remove.svg" width="24" alt="Settings" />
      </button>
    </nav>
  )

  if (loading) {
    return (
      <AppLayout header={header}>
        <div className="flex align-center justify-center" style={{ minHeight: '50vh' }}>
          <p>Loading...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout header={header}>
      <div className="library">
        {books.map((book) => (
          <figure key={book.id} className={`library__book theme--${book.theme || 'blue'}`}>
            <Link to={`/book/${book.id}`}>
              <div className="flex flex-column gap-half">
                <div className="flex-inline position-relative center">
                  <span className="book__cover-wrapper">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} className="book__cover" alt="" />
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

                <h2 className="margin-none flex flex-column txt-normal txt-tight-lines">
                  <strong>{book.title}</strong>
                  {book.subtitle && <span className="overflow-line-clamp">{book.subtitle}</span>}
                  <span className="overflow-line-clamp">{book.author}</span>
                </h2>
              </div>
            </Link>
          </figure>
        ))}

        {/* New book button */}
        <figure className="library__book library__book--empty">
          <button
            className="btn btn--reversed"
            onClick={() => navigate('/book/new')}
          >
            <img src="/images/add.svg" width="24" alt="" />
            New book
          </button>
        </figure>
      </div>
    </AppLayout>
  )
}
