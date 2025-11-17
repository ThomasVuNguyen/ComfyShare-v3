import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import AppShell from '../components/AppShell'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import Comments from '../components/comments/Comments'

const commentColors = {
  '--color-subtle-dark': '#d1d5db',
  '--color-subtle-light': '#f3f4f6',
  '--color-bg': '#ffffff',
  '--color-ink': '#111827',
  '--color-link': '#2563eb',
}

export default function BookDetails() {
  const { bookId } = useParams()
  const { user } = useAuth()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!bookId) return

      try {
        setError('')
        setLoading(true)
        const snap = await getDoc(doc(db, 'books', bookId))
        if (!snap.exists()) {
          setError('Book not found.')
          setBook(null)
          return
        }
        setBook({ id: snap.id, ...snap.data() })
      } catch (err) {
        console.error('Error loading book:', err)
        setError('Failed to load book. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [bookId])

  const createdAtLabel = useMemo(() => {
    if (!book?.createdAt) return '—'
    const date = new Date(book.createdAt)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [book?.createdAt])

  const isOwner = book && user && book.userId === user.uid

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-10">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-700">
            {error}
          </div>
        ) : !book ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-12 text-center">
            <p className="text-lg text-neutral-600">Book not found</p>
            <Link
              to="/"
              className="mt-4 inline-flex rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
            >
              Back to dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="grid gap-8 md:grid-cols-[220px,1fr]">
                <div className="rounded-3xl border border-neutral-100 bg-neutral-50 p-4">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={`${book.title} cover`}
                      className="h-72 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-2xl border border-neutral-200 bg-white">
                      <img
                        src="/images/empty-cover.png"
                        alt="Empty cover"
                        className="h-44 w-auto opacity-70"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                    <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                      {book.theme || 'Neutral'}
                    </span>
                    <span>Created {createdAtLabel}</span>
                  </div>

                  <div>
                    <h1 className="text-4xl font-semibold text-neutral-900">{book.title}</h1>
                    {book.subtitle && (
                      <p className="mt-2 text-lg text-neutral-600">{book.subtitle}</p>
                    )}
                    <p className="mt-3 text-sm text-neutral-500">
                      by {book.author || 'Unknown author'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/"
                      className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                    >
                      Back to dashboard
                    </Link>
                    {isOwner && (
                      <Link
                        to={`/book/${bookId}/edit`}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                      >
                        Edit book
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">About this book</h2>
              {book.description ? (
                <p className="mt-4 text-neutral-700 leading-relaxed">{book.description}</p>
              ) : (
                <p className="mt-4 text-neutral-500">
                  No description yet. Use the edit button to add one.
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-100 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">Discussion</h2>
                    <p className="text-sm text-neutral-500">
                      Start a conversation with your readers.
                    </p>
                  </div>
                  <span className="rounded-full border border-neutral-100 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-500">
                    {book.title}
                  </span>
                </div>
              </div>

              <div className="px-8 py-6" style={commentColors}>
                <Comments bookId={bookId} />
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}
