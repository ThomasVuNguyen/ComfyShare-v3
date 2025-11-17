import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../hooks/useAuth'
import CommentThread from './CommentThread'

export default function Comments({ bookId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [bookId])

  const loadComments = async () => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('bookId', '==', bookId),
        orderBy('createdAt', 'asc')
      )
      const snapshot = await getDocs(q)
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setComments(commentsData)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setSubmitting(true)
    try {
      const commentData = {
        bookId,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonymous',
        content: newComment,
        parentCommentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, 'comments'), commentData)
      setComments([...comments, { id: docRef.id, ...commentData }])
      setNewComment('')
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (parentCommentId, content) => {
    if (!user) return

    try {
      const commentData = {
        bookId,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonymous',
        content,
        parentCommentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, 'comments'), commentData)
      setComments([...comments, { id: docRef.id, ...commentData }])
    } catch (error) {
      console.error('Error posting reply:', error)
    }
  }

  // Build comment tree
  const rootComments = comments.filter(c => !c.parentCommentId)
  const getReplies = (commentId) => {
    return comments.filter(c => c.parentCommentId === commentId)
  }

  if (loading) {
    return <div>Loading comments...</div>
  }

  return (
    <div>
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full min-h-[100px] p-3 rounded border"
            style={{
              borderColor: 'var(--color-subtle-dark)',
              background: 'var(--color-bg)',
              color: 'var(--color-ink)',
            }}
            placeholder="Write a comment..."
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="btn-primary mt-2"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {!user && (
        <div className="mb-8 p-4 rounded" style={{ background: 'var(--color-subtle-light)' }}>
          <p>Please log in to comment</p>
        </div>
      )}

      <div className="space-y-6">
        {rootComments.length === 0 ? (
          <p style={{ color: 'var(--color-subtle-dark)' }}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          rootComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              onReply={handleReply}
              user={user}
            />
          ))
        )}
      </div>
    </div>
  )
}
