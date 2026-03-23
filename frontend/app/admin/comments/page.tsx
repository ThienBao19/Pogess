'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAdminComments, deleteAdminComment } from '@/lib/api';
import { Pagination } from '@/types';
import { Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MessageSquare, ExternalLink } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';

interface AdminComment {
  id: string;
  content: string;
  created_at: string;
  users?: { id: string; name: string; email: string };
  articles?: { id: string; title: string; slug: string };
}

export default function AdminCommentsPage() {
  const [comments, setComments]     = useState<AdminComment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage]             = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(() => {
    getAdminComments({ page, limit: 20 }).then(r => {
      setComments(r.data || []);
      setPagination(r.pagination || null);
    }).catch(() => {});
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    await deleteAdminComment(id);
    load();
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
          Comments {pagination?.total != null && <span className="text-base font-normal" style={{ color: '#9ca3af' }}>({pagination.total})</span>}
        </h1>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {comments.map(c => {
          const isExpanded = expandedId === c.id;
          const isLong = c.content.length > 120;
          return (
            <div
              key={c.id}
              className="bg-white rounded-sm p-4 transition-shadow hover:shadow-sm"
              style={{ border: '1px solid #e5e7eb' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Author + time */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: '#f3f4f6', color: 'var(--color-ink-muted)' }}
                    >
                      {c.users?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-ink)' }}>
                      {c.users?.name || 'Unknown'}
                    </span>
                    <span className="text-xs" style={{ color: '#9ca3af' }}>
                      {c.users?.email && `· ${c.users.email}`}
                    </span>
                    <span className="text-xs ml-auto shrink-0" style={{ color: '#9ca3af' }}>
                      {formatRelativeDate(c.created_at)}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-light)' }}>
                    {isLong && !isExpanded ? c.content.substring(0, 120) + '…' : c.content}
                  </p>
                  {isLong && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="text-xs mt-1 flex items-center gap-1 hover:underline"
                      style={{ color: 'var(--color-link)' }}
                    >
                      {isExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show more</>}
                    </button>
                  )}

                  {/* Article link */}
                  {c.articles && (
                    <div className="mt-2 flex items-center gap-1">
                      <MessageSquare size={11} style={{ color: '#9ca3af' }} />
                      <span className="text-xs" style={{ color: '#9ca3af' }}>on</span>
                      <a
                        href={`/articles/${c.articles.slug}`}
                        target="_blank"
                        className="text-xs hover:underline flex items-center gap-1 truncate max-w-xs"
                        style={{ color: 'var(--color-link)' }}
                      >
                        {c.articles.title} <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(c.id)}
                  className="shrink-0 p-2 rounded hover:bg-red-50 transition-colors"
                  title="Delete comment"
                >
                  <Trash2 size={14} style={{ color: 'var(--color-accent)' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-20" style={{ color: '#9ca3af' }}>
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No comments yet.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs" style={{ color: '#9ca3af' }}>
            Page {page} of {totalPages} · {pagination?.total} total
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-outline py-1 px-2 text-xs disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="btn py-1 px-3 text-xs"
                  style={{
                    backgroundColor: p === page ? 'var(--color-ink)' : 'transparent',
                    color: p === page ? 'white' : 'var(--color-ink)',
                    border: p === page ? 'none' : '1.5px solid #e5e7eb',
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-outline py-1 px-2 text-xs disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
