'use client';

import { useState, useEffect } from 'react';
import {
  getAdminCategories, createAdminCategory,
  updateAdminCategory, deleteAdminCategory,
} from '@/lib/api';
import { Category } from '@/types';
import { Pencil, Trash2, Plus, Check, X, Tag } from 'lucide-react';

interface CategoryWithCount extends Category {
  article_count?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [newName, setNewName]   = useState('');
  const [newDesc, setNewDesc]   = useState('');
  const [adding, setAdding]     = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const load = () => getAdminCategories().then(r => setCategories(r.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await createAdminCategory({ name: newName.trim(), description: newDesc.trim() || undefined });
      setNewName(''); setNewDesc('');
      load();
    } finally { setAdding(false); }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    await updateAdminCategory(id, { name: editName.trim(), description: editDesc.trim() });
    setEditingId(null);
    load();
  };

  const startEdit = (cat: CategoryWithCount) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? Articles in it will be uncategorized.')) return;
    await deleteAdminCategory(id);
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
        Categories <span className="text-base font-normal" style={{ color: '#9ca3af' }}>({categories.length})</span>
      </h1>

      {/* Add form */}
      <div className="bg-white p-5 mb-6 rounded-sm" style={{ border: '1px solid #e5e7eb' }}>
        <h2 className="font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#6b7280', letterSpacing: '0.08em' }}>
          <Plus size={13} /> Add New Category
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Category name *"
              required
              className="input flex-1 min-w-40"
            />
            <button type="submit" disabled={adding} className="btn btn-primary">
              {adding ? 'Adding…' : 'Add Category'}
            </button>
          </div>
          <input
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="input text-sm"
          />
        </form>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="bg-white rounded-sm p-5 transition-shadow hover:shadow-sm"
            style={{ border: '1px solid #e5e7eb' }}
          >
            {editingId === cat.id ? (
              /* Edit mode */
              <div className="space-y-3">
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="input text-sm font-semibold"
                  placeholder="Category name"
                  onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                />
                <input
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="input text-sm"
                  placeholder="Description"
                  onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(cat.id)}
                    className="btn btn-primary py-1 px-3 text-xs"
                  >
                    <Check size={13} /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="btn btn-outline py-1 px-3 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#f0f9ff' }}
                    >
                      <Tag size={14} style={{ color: 'var(--color-link)' }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>{cat.name}</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>/{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => startEdit(cat)} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Edit">
                      <Pencil size={13} style={{ color: 'var(--color-link)' }} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete">
                      <Trash2 size={13} style={{ color: 'var(--color-accent)' }} />
                    </button>
                  </div>
                </div>
                {cat.description && (
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                    {cat.description}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20" style={{ color: '#9ca3af' }}>
          <Tag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No categories yet.</p>
        </div>
      )}
    </div>
  );
}
