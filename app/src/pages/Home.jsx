import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import AppShell from '../components/AppShell'

export default function Home() {
  const { user } = useAuth()
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

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p>Loading...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-neutral-600">Manage your books</p>
          </div>
          <Link
            to="/book/new"
            className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            New Book
          </Link>
        </div>

        {/* Books Table */}
        {books.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center">
            <p className="mb-4 text-lg text-neutral-600">No books yet</p>
            <Link
              to="/book/new"
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              Create your first book
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-5 text-sm font-semibold text-neutral-900">
                      {book.title}
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-neutral-600">
                      {new Date(book.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right text-sm">
                      <Link
                        to={`/book/${book.id}`}
                        className="font-semibold text-neutral-900 underline hover:text-neutral-600"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  )
}
