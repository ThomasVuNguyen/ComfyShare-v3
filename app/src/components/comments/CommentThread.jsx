import { useState } from 'react'
import { formatDistance } from '../../lib/dateUtils'

function Comment({ comment, onReply, user, isReply = false }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')

  const handleSubmitReply = (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    onReply(comment.id, replyContent)
    setReplyContent('')
    setShowReplyForm(false)
  }

  return (
    <div className={isReply ? 'ml-8' : ''}>
      <div
        className="p-4 rounded border"
        style={{ borderColor: 'var(--color-subtle-dark)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{comment.userDisplayName}</span>
          <span className="text-sm" style={{ color: 'var(--color-subtle-dark)' }}>
            {formatDistance(comment.createdAt)}
          </span>
        </div>
        <p className="mb-2">{comment.content}</p>
        {user && !isReply && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm"
            style={{ color: 'var(--color-link)' }}
          >
            Reply
          </button>
        )}
      </div>

      {showReplyForm && (
        <form onSubmit={handleSubmitReply} className="mt-3 ml-8">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full min-h-[80px] p-3 rounded border text-sm"
            style={{
              borderColor: 'var(--color-subtle-dark)',
              background: 'var(--color-bg)',
              color: 'var(--color-ink)',
            }}
            placeholder="Write a reply..."
          />
          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn-primary text-sm">
              Reply
            </button>
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="btn text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function CommentThread({ comment, replies, onReply, user }) {
  return (
    <div>
      <Comment comment={comment} onReply={onReply} user={user} />
      {replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              user={user}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
