'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAdminArticles, deleteAdminArticle, createAdminArticle,
  updateAdminArticle, getAdminCategories,
} from '@/lib/api';
import { Article, Category, Pagination } from '@/types';
import { Pencil, Trash2, Plus, X, Search, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ArticleForm {
  title: string; description: string; content: string;
  cover_image: string; author: string; category_id: string; is_featured: boolean;
}

const EMPTY_FORM: ArticleForm = {
  title: '', description: '', content: '', cover_image: '', author: '', category_id: '', is_featured: false,
};

export default function AdminArticlesPage() {
  const [articles, setArticles]       = useState<Article[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [pagination, setPagination]   = useState<Pagination | null>(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<Article | null>(null);
  const [form, setForm]               = useState<ArticleForm>(EMPTY_FORM);
  const [loading, setLoading]         = useState(false);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSource, setFilterSource]     = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(() => {
    const params: Record<string, unknown> = { page, limit: 15 };
    if (search) params.search = search;
    if (filterCategory) params.category = filterCategory;
    if (filterSource) params.source = filterSource;
    getAdminArticles(params).then(r => {
      setArticles(r.data || []);
      setPagination(r.pagination || null);
    }).catch(() => {});
  }, [page, search, filterCategory, filterSource]);

  useEffect(() => {
    getAdminCategories().then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      title: a.title, description: a.description || '',
      content: a.content || '', cover_image: a.cover_image || '',
      author: a.author || '', category_id: String((a.categories as unknown as Category)?.id || ''),
      is_featured: a.is_featured,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, category_id: parseInt(form.category_id) };
      if (editing) {
        await updateAdminArticle(editing.id, payload);
      } else {
        await createAdminArticle(payload);
      }
      setModalOpen(false);
      load();
    } catch { alert('Save failed.'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await deleteAdminArticle(id);
    load();
  };

  const totalPages = pagination ? Math.ceil((pagination.total || 0) / (pagination.limit || 15)) : 1;

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
          Articles {pagination?.total != null && <span className="text-base font-normal" style={{ color: '#9ca3af' }}>({pagination.total})</span>}
        </h1>
        <button id="admin-create-article-btn" onClick={openCreate} className="btn btn-primary flex items-center gap-2">
          <Plus size={16} /> New Article
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 mb-5 rounded-sm flex flex-wrap items-center gap-3" style={{ border: '1px solid #e5e7eb' }}>
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search articles…"
              className="input pl-9 py-2 text-sm"
            />
          </div>
          <button type="submit" className="btn btn-outline py-2 text-xs">Search</button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
              className="text-xs hover:underline"
              style={{ color: 'var(--color-link)' }}
            >
              Clear
            </button>
          )}
        </form>

        <select
          value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
          className="input py-2 text-sm w-auto"
          style={{ minWidth: '140px' }}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          value={filterSource}
          onChange={e => { setFilterSource(e.target.value); setPage(1); }}
          className="input py-2 text-sm w-auto"
          style={{ minWidth: '120px' }}
        >
          <option value="">All Sources</option>
          <option value="admin">Admin</option>
          <option value="nyt">NYT</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              {['Title', 'Category', 'Source', 'Author', 'Date', '', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium max-w-xs truncate" style={{ color: 'var(--color-ink)' }}>
                  {a.title}
                </td>
                <td className="px-4 py-3">
                  <span className="category-badge">{(a.categories as unknown as Category)?.name ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: a.source === 'nyt' ? '#fef3c7' : '#f0f9ff',
                      color: a.source === 'nyt' ? '#92400e' : '#0369a1',
                    }}
                  >
                    {a.source}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: '#6b7280' }}>{a.author || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#6b7280' }}>{formatDate(a.published_at)}</td>
                <td className="px-4 py-3">
                  {a.is_featured && <Star size={14} style={{ color: '#d97706' }} fill="#d97706" />}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(a)} className="hover:opacity-70 transition-opacity p-1" title="Edit">
                      <Pencil size={14} style={{ color: 'var(--color-link)' }} />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="hover:opacity-70 transition-opacity p-1" title="Delete">
                      <Trash2 size={14} style={{ color: 'var(--color-accent)' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && (
          <p className="text-center py-12 text-sm" style={{ color: '#9ca3af' }}>No articles found.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-16 z-50 px-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-sm p-6 mb-8" style={{ border: '1px solid #e5e7eb' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                {editing ? 'Edit Article' : 'New Article'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="hover:opacity-70 transition-opacity"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6b7280' }}>Title *</label>
                <input required value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6b7280' }}>Author</label>
                  <input value={form.author}
                    onChange={e => setForm(p => ({ ...p, author: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6b7280' }}>Category *</label>
                  <select required value={form.category_id}
                    onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className="input">
                    <option value="">Select…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6b7280' }}>Cover image URL</label>
                <input value={form.cover_image}
                  onChange={e => setForm(p => ({ ...p, cover_image: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6b7280' }}>Description</label>
                <textarea rows={2} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6b7280' }}>Content</label>
                <textarea rows={6} value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="input resize-y" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={form.is_featured}
                  onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} />
                <Star size={14} style={{ color: '#d97706' }} /> Featured article
              </label>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
