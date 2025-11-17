import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { generatePositionScore } from '../lib/utils'
import LeavesList from '../components/editor/LeavesList'
import LeafEditor from '../components/editor/LeafEditor'

export default function BookEditor() {
  const { bookId } = useParams()
  const { user } = useAuth()
  const [book, setBook] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [selectedLeaf, setSelectedLeaf] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookAndLeaves()
  }, [bookId])

  const loadBookAndLeaves = async () => {
    try {
      // Load book
      const bookDoc = await getDoc(doc(db, 'books', bookId))
      if (!bookDoc.exists()) {
        console.error('Book not found')
        return
      }
      const bookData = { id: bookDoc.id, ...bookDoc.data() }

      // Check if user owns this book
      if (bookData.userId !== user.uid) {
        console.error('Unauthorized')
        return
      }

      setBook(bookData)

      // Load leaves
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
      console.error('Error loading book and leaves:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLeaf = async (type) => {
    try {
      // Calculate position score
      const lastLeaf = leaves[leaves.length - 1]
      const positionScore = generatePositionScore(lastLeaf?.positionScore || 0)

      // Create the leafable content first
      let leafableId
      const timestamp = new Date().toISOString()

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

      // Create the leaf
      const leafData = {
        bookId,
        leafableType: type,
        leafableId,
        title: type === 'page' ? 'New Page' : type === 'section' ? 'New Section' : 'New Picture',
        positionScore,
        status: 'active',
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      const leafDoc = await addDoc(collection(db, 'leaves'), leafData)
      const newLeaf = { id: leafDoc.id, ...leafData }
      setLeaves([...leaves, newLeaf])
      setSelectedLeaf(newLeaf)
    } catch (error) {
      console.error('Error adding leaf:', error)
    }
  }

  const handleUpdateLeaf = async (leafId, updates) => {
    try {
      await updateDoc(doc(db, 'leaves', leafId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      })

      setLeaves(leaves.map(leaf =>
        leaf.id === leafId ? { ...leaf, ...updates } : leaf
      ))
    } catch (error) {
      console.error('Error updating leaf:', error)
    }
  }

  const handleDeleteLeaf = async (leafId) => {
    if (!confirm('Are you sure you want to delete this?')) return

    try {
      await updateDoc(doc(db, 'leaves', leafId), {
        status: 'trashed',
        updatedAt: new Date().toISOString(),
      })

      setLeaves(leaves.filter(leaf => leaf.id !== leafId))
      if (selectedLeaf?.id === leafId) {
        setSelectedLeaf(null)
      }
    } catch (error) {
      console.error('Error deleting leaf:', error)
    }
  }

  const handleReorderLeaves = async (reorderedLeaves) => {
    try {
      // Update position scores
      const updates = reorderedLeaves.map((leaf, index) => {
        const newScore = (index + 1) * 1000
        return updateDoc(doc(db, 'leaves', leaf.id), {
          positionScore: newScore,
          updatedAt: new Date().toISOString(),
        })
      })

      await Promise.all(updates)

      // Update local state
      const updatedLeaves = reorderedLeaves.map((leaf, index) => ({
        ...leaf,
        positionScore: (index + 1) * 1000,
      }))
      setLeaves(updatedLeaves)
    } catch (error) {
      console.error('Error reordering leaves:', error)
    }
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
        <p>Book not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4" style={{ borderColor: 'var(--color-subtle-dark)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="text-sm mb-1 block" style={{ color: 'var(--color-link)' }}>
              ← Back to books
            </Link>
            <h1 className="text-xl font-bold">{book.title}</h1>
          </div>
          <Link to={`/book/${bookId}`} className="btn">
            Preview
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Leaves List */}
        <aside className="w-80 border-r overflow-y-auto" style={{ borderColor: 'var(--color-subtle-dark)' }}>
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <button onClick={() => handleAddLeaf('page')} className="btn text-sm flex-1">
                + Page
              </button>
              <button onClick={() => handleAddLeaf('section')} className="btn text-sm flex-1">
                + Section
              </button>
              <button onClick={() => handleAddLeaf('picture')} className="btn text-sm flex-1">
                + Picture
              </button>
            </div>

            <LeavesList
              leaves={leaves}
              selectedLeaf={selectedLeaf}
              onSelectLeaf={setSelectedLeaf}
              onReorder={handleReorderLeaves}
            />
          </div>
        </aside>

        {/* Main Editor */}
        <main className="flex-1 overflow-y-auto">
          {selectedLeaf ? (
            <LeafEditor
              leaf={selectedLeaf}
              onUpdateLeaf={handleUpdateLeaf}
              onDeleteLeaf={handleDeleteLeaf}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: 'var(--color-subtle-dark)' }}>
                Select a leaf from the sidebar or create a new one
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
