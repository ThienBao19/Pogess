'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAdminUsers, deleteAdminUser, toggleLockUser, changeUserRole,
} from '@/lib/api';
import { User, Pagination } from '@/types';
import { Trash2, Lock, Unlock, Search, ChevronLeft, ChevronRight, ShieldCheck, UserIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    const params: Record<string, unknown> = { page, limit: 15 };
    if (search) params.search = search;
    getAdminUsers(params).then(r => {
      setUsers(r.data || []);
      setPagination(r.pagination || null);
    }).catch(() => {});
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleLock = async (id: string) => {
    await toggleLockUser(id);
    load();
  };

  const handleRoleChange = async (id: string, newRole: 'user' | 'admin') => {
    if (!confirm(`Change this user's role to "${newRole}"?`)) return;
    try {
      await changeUserRole(id, newRole);
      load();
    } catch {
      alert('Failed to change role.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    await deleteAdminUser(id);
    load();
  };

  const totalPages = pagination ? Math.ceil((pagination.total || 0) / (pagination.limit || 15)) : 1;

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
          Users {pagination?.total != null && <span className="text-base font-normal" style={{ color: '#9ca3af' }}>({pagination.total})</span>}
        </h1>
      </div>

      {/* Search bar */}
      <div className="bg-white p-4 mb-5 rounded-sm" style={{ border: '1px solid #e5e7eb' }}>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name or email…"
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
      </div>

      <div className="bg-white rounded-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isSelf = u.id === currentUser?.id;
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: '#f3f4f6', color: 'var(--color-ink-muted)' }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--color-ink)' }}>
                        {u.name} {isSelf && <span className="text-xs" style={{ color: '#9ca3af' }}>(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#6b7280' }}>{u.email}</td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span
                        className="text-xs font-bold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                        style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
                      >
                        <ShieldCheck size={11} /> {u.role}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value as 'user' | 'admin')}
                        className="text-xs font-bold uppercase px-2 py-1 rounded-full border-none cursor-pointer"
                        style={{
                          backgroundColor: u.role === 'admin' ? '#fef3c7' : '#f0f9ff',
                          color: u.role === 'admin' ? '#92400e' : '#0369a1',
                        }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: u.is_locked ? '#fef2f2' : '#f0fdf4',
                        color: u.is_locked ? 'var(--color-accent)' : '#059669',
                      }}
                    >
                      {u.is_locked ? <><Lock size={10} /> Locked</> : <><Unlock size={10} /> Active</>}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#6b7280' }}>{u.created_at ? formatDate(u.created_at) : '—'}</td>
                  <td className="px-4 py-3">
                    {!isSelf && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLock(u.id)}
                          title={u.is_locked ? 'Unlock' : 'Lock'}
                          className="hover:opacity-70 transition-opacity p-1"
                        >
                          {u.is_locked
                            ? <Unlock size={14} style={{ color: '#059669' }} />
                            : <Lock size={14} style={{ color: '#d97706' }} />
                          }
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="hover:opacity-70 transition-opacity p-1" title="Delete">
                          <Trash2 size={14} style={{ color: 'var(--color-accent)' }} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center py-12 text-sm" style={{ color: '#9ca3af' }}>No users found.</p>}
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
    </div>
  );
}
