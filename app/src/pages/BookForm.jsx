import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import AppShell from '../components/AppShell'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { generateSlug } from '../lib/utils'

const THEME_OPTIONS = [
  { value: 'neutral', label: 'Neutral', swatch: '#0f172a' },
  { value: 'sunset', label: 'Sunset', swatch: '#f97316' },
  { value: 'forest', label: 'Forest', swatch: '#15803d' },
  { value: 'ocean', label: 'Ocean', swatch: '#0ea5e9' },
  { value: 'midnight', label: 'Midnight', swatch: '#312e81' },
]

export default function BookForm() {
  const { bookId } = useParams()
  const isEditMode = Boolean(bookId)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [theme, setTheme] = useState(THEME_OPTIONS[0].value)
  const [coverUrl, setCoverUrl] = useState('')
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [error, setError] = useState('')

  const loadBook = useCallback(async () => {
    if (!bookId) return
    try {
      setError('')
      setLoading(true)
      const snap = await getDoc(doc(db, 'books', bookId))
      if (!snap.exists()) {
        setError('Book not found.')
        return
      }
      const data = snap.data()
      if (data.userId && data.userId !== user.uid) {
        setError('You do not have permission to edit this book.')
        return
      }

      setTitle(data.title || '')
      setSubtitle(data.subtitle || '')
      setAuthor(data.author || user.displayName || '')
      setDescription(data.description || '')
      setTheme(data.theme || THEME_OPTIONS[0].value)
      setCoverUrl(data.coverUrl || '')
    } catch (err) {
      console.error('Error loading book:', err)
      setError('Failed to load book. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [bookId, user])

  useEffect(() => {
    if (!user) return

    if (isEditMode) {
      loadBook()
    } else {
      setAuthor((prev) => prev || user.displayName || '')
      setLoading(false)
    }
  }, [user, isEditMode, loadBook])

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploadingCover(true)
    setError('')

    try {
      const storageRef = ref(storage, `covers/${user.uid}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setCoverUrl(url)
    } catch (err) {
      console.error('Error uploading cover:', err)
      setError('Failed to upload cover. Please try another image.')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!title.trim() || !user) {
      setError('A title is required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const now = new Date().toISOString()
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        author: author.trim() || user.displayName || 'Anonymous',
        description: description.trim(),
        theme,
        coverUrl,
        slug: generateSlug(title),
        updatedAt: now,
      }

      if (isEditMode) {
        await updateDoc(doc(db, 'books', bookId), payload)
        navigate(`/book/${bookId}`)
      } else {
        const docRef = await addDoc(collection(db, 'books'), {
          ...payload,
          userId: user.uid,
          createdAt: now,
        })
        navigate(`/book/${docRef.id}`)
      }
    } catch (err) {
      console.error('Error saving book:', err)
      setError('Failed to save book. Please try again.')
    } finally {
      setSaving(false)
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

  const actionLabel = isEditMode ? 'Save changes' : 'Create book'

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-neutral-500">
              {isEditMode ? 'Update your book details' : 'Share a new book with the world'}
            </p>
            <h1 className="text-3xl font-semibold text-neutral-900">
              {isEditMode ? 'Edit book' : 'New book'}
            </h1>
          </div>

          <div className="flex gap-2">
            <Link
              to="/"
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
            >
              Back
            </Link>
            {isEditMode && (
              <Link
                to={`/book/${bookId}`}
                className="rounded-full border border-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                View book
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm"
        >
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none"
                placeholder="Give your book a meaningful title"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  placeholder="Optional subtitle"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  placeholder="How should we show your name?"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[220px,1fr]">
            <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center">
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                {coverUrl ? (
                  <img src={coverUrl} alt="Book cover" className="h-64 w-full object-cover" />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-white">
                    <img
                      src="/images/empty-cover.png"
                      alt="Empty cover"
                      className="h-48 w-auto opacity-70"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <label className="relative inline-flex cursor-pointer justify-center">
                  <span className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900">
                    {uploadingCover ? 'Uploading...' : 'Upload cover'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover || saving}
                  />
                </label>

                {coverUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverUrl('')}
                    className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    Remove cover
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-neutral-700">
                Theme
              </label>
              <div className="flex flex-wrap gap-3">
                {THEME_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition-colors ${
                      theme === option.value
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: option.swatch }}
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none"
              placeholder="Describe what this book is about..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || uploadingCover}
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? `${actionLabel}...` : actionLabel}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
