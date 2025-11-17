import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'
import { generateSlug } from '../lib/utils'

const THEMES = [
  { value: 'blue', color: 'var(--theme-color--blue)' },
  { value: 'orange', color: 'var(--theme-color--orange)' },
  { value: 'magenta', color: 'var(--theme-color--magenta)' },
  { value: 'green', color: 'var(--theme-color--green)' },
  { value: 'violet', color: 'var(--theme-color--violet)' },
  { value: 'white', color: 'var(--theme-color--white)' },
  { value: 'black', color: 'var(--theme-color--black)' },
]

export default function BookEdit() {
  const { bookId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [author, setAuthor] = useState('')
  const [theme, setTheme] = useState('blue')
  const [coverUrl, setCoverUrl] = useState('')
  const [removeCover, setRemoveCover] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  const isNew = bookId === 'new'

  useEffect(() => {
    if (isNew) {
      setAuthor(user?.displayName || '')
      setLoading(false)
    } else {
      loadBook()
    }
  }, [bookId])

  const loadBook = async () => {
    try {
      const bookDoc = await getDoc(doc(db, 'books', bookId))
      if (!bookDoc.exists() || bookDoc.data().userId !== user.uid) {
        navigate('/')
        return
      }

      const bookData = bookDoc.data()
      setBook(bookData)
      setTitle(bookData.title || '')
      setSubtitle(bookData.subtitle || '')
      setAuthor(bookData.author || '')
      setTheme(bookData.theme || 'blue')
      setCoverUrl(bookData.coverUrl || '')
    } catch (error) {
      console.error('Error loading book:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const storageRef = ref(storage, `covers/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setCoverUrl(url)
      setRemoveCover(false)
    } catch (error) {
      console.error('Error uploading cover:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const bookData = {
        title,
        subtitle: subtitle || '',
        author: author || user.displayName,
        slug: generateSlug(title),
        theme,
        coverUrl: removeCover ? '' : coverUrl,
        published: true,
        updatedAt: new Date().toISOString(),
      }

      if (isNew) {
        bookData.userId = user.uid
        bookData.createdAt = new Date().toISOString()

        const docRef = await addDoc(collection(db, 'books'), bookData)
        navigate(`/book/${docRef.id}`)
      } else {
        await updateDoc(doc(db, 'books', bookId), bookData)
        navigate(`/book/${bookId}`)
      }
    } catch (error) {
      console.error('Error saving book:', error)
    }
  }

  if (loading) {
    return <AppLayout><p>Loading...</p></AppLayout>
  }

  const header = (
    <nav>
      <Link to={isNew ? '/' : `/book/${bookId}`} className="btn">
        <img src="/images/arrow-left.svg" width="24" alt="Back" />
      </Link>

      <div className="breadcrumbs">
        <Link to="/">Library</Link>
        <span> ▸ </span>
        <strong>{isNew ? 'New Book' : 'Edit Book'}</strong>
      </div>

      <span className="btn btn--placeholder"></span>
    </nav>
  )

  return (
    <AppLayout header={header}>
      <form id="book-editor" onSubmit={handleSubmit}>
        <div className="book__form flex align-center gap full-width">
          {/* Theme & Cover */}
          <div className="flex gap-half">
            {/* Theme selector */}
            <fieldset className="flex flex-column unpad borderless">
              <legend className="for-screen-reader">Cover color</legend>

              {THEMES.map((t) => (
                <label
                  key={t.value}
                  className="btn btn--circle txt-small"
                  style={{ '--btn-background': t.color }}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={t.value}
                    checked={theme === t.value}
                    onChange={(e) => setTheme(e.target.value)}
                  />
                  <img src="/images/check.svg" width="24" className="checked" alt="" />
                </label>
              ))}
            </fieldset>

            {/* Cover upload */}
            <div>
              <label className="position-relative">
                {!coverUrl && !uploading && (
                  <span className="btn btn--reversed book__cover--add">
                    <img src="/images/camera.svg" width="24" alt="Add cover" />
                  </span>
                )}

                <div className="input--file">
                  {coverUrl && !removeCover ? (
                    <img src={coverUrl} className="book__cover" alt="" />
                  ) : (
                    <img src="/images/empty-cover.png" className="book__cover" alt="" />
                  )}
                  <input type="file" accept="image/*" onChange={handleCoverUpload} />
                </div>
              </label>

              {coverUrl && !removeCover && (
                <label className="btn btn--negative book__cover--remove">
                  <img src="/images/minus.svg" width="24" alt="Remove" />
                  <input
                    type="checkbox"
                    checked={removeCover}
                    onChange={(e) => setRemoveCover(e.target.checked)}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-column gap full-width">
            {/* Title */}
            <div className="flex align-center gap txt-medium">
              <h1 className="txt-xx-large margin-none full-width">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Book title"
                  required
                />
              </h1>
            </div>

            {/* Subtitle */}
            <div className="flex align-center gap txt-medium">
              <small className="txt-normal txt-large full-width">
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="input"
                  placeholder="Subtitle"
                />
              </small>
            </div>

            {/* Author */}
            <div className="flex align-center gap txt-medium">
              <small className="txt-normal txt-large full-width">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="input"
                  placeholder="Author"
                />
              </small>
            </div>

            <button type="submit" className="btn btn--link">
              {isNew ? 'Create Book' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </AppLayout>
  )
}
