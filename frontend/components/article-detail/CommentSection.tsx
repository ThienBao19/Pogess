'use client';

import { useState, useEffect, useCallback } from 'react';
import { getComments, addComment, deleteComment } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Comment } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import { Trash2, MessageCircle } from 'lucide-react';

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const res = await getComments(articleId);
      setComments(res.data || []);
    } catch {}
  }, [articleId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await addComment({ article_id: articleId, content: content.trim() });
      setContent('');
      fetchComments();
    } catch {
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  return (
    <section className="mt-10">
      <div className="section-divider mb-6">
        <h2
          className="font-bold uppercase tracking-wider"
          style={{ fontSize: '0.8rem', color: 'var(--color-ink)', letterSpacing: '0.1em' }}
        >
          <MessageCircle size={14} className="inline mr-2" />
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            id="comment-input"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
            className="input mb-2 resize-none"
            style={{ fontFamily: 'Georgia, serif' }}
          />
          {error && <p className="text-sm mb-2" style={{ color: 'var(--color-accent)' }}>{error}</p>}
          <button
            type="submit"
            id="submit-comment-btn"
            disabled={submitting || !content.trim()}
            className="btn btn-primary"
          >
            {submitting ? 'Posting…' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p
          className="mb-6 text-sm py-3 px-4"
          style={{ backgroundColor: 'var(--color-paper-warm)', border: '1px solid var(--color-border)', color: 'var(--color-ink-muted)' }}
        >
          <a href="/auth/login" style={{ color: 'var(--color-link)' }}>Log in</a> to leave a comment.
        </p>
      )}

      {/* Comments list */}
      <div className="space-y-0">
        {comments.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'var(--color-ink-muted)' }}>
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map(c => (
            <div
              key={c.id}
              className="py-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: 'var(--color-ink)' }}
                  >
                    {c.users?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-ink)' }}>
                    {c.users?.name}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                    {formatRelativeDate(c.created_at)}
                  </span>
                </div>
                {(user?.id === c.users?.id || user?.role === 'admin') && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--color-ink-muted)' }}
                    title="Delete comment"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <p
                className="text-sm leading-relaxed pl-9"
                style={{ color: 'var(--color-ink-light)', fontFamily: 'Georgia, serif' }}
              >
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
