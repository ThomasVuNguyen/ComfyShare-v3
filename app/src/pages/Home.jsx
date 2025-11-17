import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { generateSlug } from '../lib/utils'

export default function Home() {
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewBookForm, setShowNewBookForm] = useState(false)
  const [newBook, setNewBook] = useState({ title: '', subtitle: '', author: '' })

  useEffect(() => {
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

  const handleCreateBook = async (e) => {
    e.preventDefault()
    try {
      const slug = generateSlug(newBook.title)
      const bookData = {
        title: newBook.title,
        subtitle: newBook.subtitle || '',
        author: newBook.author || user.displayName,
        slug,
        userId: user.uid,
        published: true,
        theme: 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, 'books'), bookData)
      setBooks([{ id: docRef.id, ...bookData }, ...books])
      setShowNewBookForm(false)
      setNewBook({ title: '', subtitle: '', author: '' })
    } catch (error) {
      console.error('Error creating book:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-4" style={{ borderColor: 'var(--color-subtle-dark)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">ComfyShare</h1>
          <div className="flex items-center gap-4">
            <span>Hello, {user.displayName}</span>
            <button onClick={handleLogout} className="btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">My Books</h2>
          <button
            onClick={() => setShowNewBookForm(true)}
            className="btn-primary"
          >
            New Book
          </button>
        </div>

        {showNewBookForm && (
          <div className="mb-8 p-6 rounded border" style={{ borderColor: 'var(--color-subtle-dark)', background: 'var(--color-subtle-light)' }}>
            <h3 className="text-lg font-bold mb-4">Create a new book</h3>
            <form onSubmit={handleCreateBook} className="space-y-4">
              <div>
                <label htmlFor="title" className="block mb-2 font-medium">Title *</label>
                <input
                  id="title"
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  required
                  className="input"
                  placeholder="My Amazing Book"
                />
              </div>

              <div>
                <label htmlFor="subtitle" className="block mb-2 font-medium">Subtitle</label>
                <input
                  id="subtitle"
                  type="text"
                  value={newBook.subtitle}
                  onChange={(e) => setNewBook({ ...newBook, subtitle: e.target.value })}
                  className="input"
                  placeholder="A story about..."
                />
              </div>

              <div>
                <label htmlFor="author" className="block mb-2 font-medium">Author</label>
                <input
                  id="author"
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="input"
                  placeholder={user.displayName}
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Create Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewBookForm(false)}
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-4" style={{ color: 'var(--color-subtle-dark)' }}>
              You haven't created any books yet.
            </p>
            <button onClick={() => setShowNewBookForm(true)} className="btn-primary">
              Create your first book
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div
                key={book.id}
                className="p-6 rounded border hover:shadow-md transition-shadow"
                style={{ borderColor: 'var(--color-subtle-dark)' }}
              >
                <h3 className="text-lg font-bold mb-2">{book.title}</h3>
                {book.subtitle && (
                  <p className="text-sm mb-3" style={{ color: 'var(--color-subtle-dark)' }}>
                    {book.subtitle}
                  </p>
                )}
                <p className="text-sm mb-4">by {book.author}</p>
                <div className="flex gap-2">
                  <Link to={`/book/${book.id}/edit`} className="btn text-sm">
                    Edit
                  </Link>
                  <Link to={`/book/${book.id}`} className="btn text-sm">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
