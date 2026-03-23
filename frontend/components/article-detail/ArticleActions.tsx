'use client';

import { useState, useEffect } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { toggleLike, checkLike, getLikeCount, toggleBookmark, checkBookmark } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ArticleActionsProps {
  articleId: string;
  initialLikes: number;
}

export default function ArticleActions({ articleId, initialLikes }: ArticleActionsProps) {
  const { user } = useAuth();
  const [liked, setLiked]           = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes]           = useState(initialLikes);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (!user) return;
    checkLike(articleId).then(r => setLiked(r.liked)).catch(() => {});
    checkBookmark(articleId).then(r => setBookmarked(r.bookmarked)).catch(() => {});
  }, [user, articleId]);

  const handleLike = async () => {
    if (!user) { alert('Please log in to like articles.'); return; }
    setLoading(true);
    try {
      const res = await toggleLike(articleId);
      setLiked(res.liked);
      setLikes(prev => res.liked ? prev + 1 : prev - 1);
    } finally { setLoading(false); }
  };

  const handleBookmark = async () => {
    if (!user) { alert('Please log in to bookmark articles.'); return; }
    setLoading(true);
    try {
      const res = await toggleBookmark(articleId);
      setBookmarked(res.bookmarked);
    } finally { setLoading(false); }
  };

  return (
    <div
      className="flex items-center gap-4 py-4 mb-8"
      style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
    >
      <button
        id="like-btn"
        onClick={handleLike}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-sm"
        style={{
          backgroundColor: liked ? 'var(--color-accent)' : 'transparent',
          color: liked ? 'white' : 'var(--color-ink)',
          border: `1.5px solid ${liked ? 'var(--color-accent)' : 'var(--color-border)'}`,
        }}
      >
        <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
        {likes} {likes === 1 ? 'Like' : 'Likes'}
      </button>

      <button
        id="bookmark-btn"
        onClick={handleBookmark}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-sm"
        style={{
          backgroundColor: bookmarked ? 'var(--color-ink)' : 'transparent',
          color: bookmarked ? 'white' : 'var(--color-ink)',
          border: `1.5px solid ${bookmarked ? 'var(--color-ink)' : 'var(--color-border)'}`,
        }}
      >
        <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
        {bookmarked ? 'Saved' : 'Bookmark'}
      </button>
    </div>
  );
}
