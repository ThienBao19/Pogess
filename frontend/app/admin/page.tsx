'use client';

import { useEffect, useState } from 'react';
import { getAdminStats, syncNYT } from '@/lib/api';
import {
  FileText, Users, MessageSquare, Heart, RefreshCw,
  Database, Bookmark, TrendingUp,
} from 'lucide-react';

interface CacheStats {
  totalEntries: number;
  activeEntries: number;
  expiredEntries: number;
}

interface Stats {
  totalArticles: number;
  totalUsers: number;
  totalComments: number;
  totalLikes: number;
  totalBookmarks: number;
  recentArticles: number;
  nytCache?: CacheStats;
}

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: number; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-sm shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#6b7280', letterSpacing: '0.07em' }}>
          {label}
        </span>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-ink)' }}>
        {value?.toLocaleString() ?? '—'}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{sub}</p>
      )}
    </div>
  );
}

function CacheStatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white p-5 rounded-sm shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
      <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280', letterSpacing: '0.07em' }}>
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color }}>
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {});
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await syncNYT();
      setSyncMsg('✅ NYT articles synced successfully!');
      getAdminStats().then(setStats).catch(() => {});
    } catch {
      setSyncMsg('❌ Sync failed. Check backend logs.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Overview of your news platform</p>
        </div>
        <button
          id="admin-sync-nyt-btn"
          onClick={handleSync}
          disabled={syncing}
          className="btn btn-outline flex items-center gap-2"
        >
          <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing NYT…' : 'Sync NYT Articles'}
        </button>
      </div>

      {syncMsg && (
        <p className="mb-6 text-sm py-2 px-4 rounded-sm" style={{
          backgroundColor: syncMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${syncMsg.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`,
          color: syncMsg.startsWith('✅') ? '#166534' : '#991b1b',
        }}>
          {syncMsg}
        </p>
      )}

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        <StatCard label="Articles" value={stats?.totalArticles ?? 0} icon={FileText} color="#326891"
          sub={stats?.recentArticles ? `${stats.recentArticles} added this week` : undefined} />
        <StatCard label="Users" value={stats?.totalUsers ?? 0} icon={Users} color="#059669" />
        <StatCard label="Comments" value={stats?.totalComments ?? 0} icon={MessageSquare} color="#d97706" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <StatCard label="Likes" value={stats?.totalLikes ?? 0} icon={Heart} color="#c4160a" />
        <StatCard label="Bookmarks" value={stats?.totalBookmarks ?? 0} icon={Bookmark} color="#7c3aed" />
        <StatCard label="This Week" value={stats?.recentArticles ?? 0} icon={TrendingUp} color="#0891b2"
          sub="new articles published" />
      </div>

      {/* NYT Cache Stats */}
      {stats?.nytCache && (
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-ink)' }}>
            <Database size={18} /> NYT API Cache
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <CacheStatCard label="Total Entries" value={stats.nytCache.totalEntries} color="#326891" />
            <CacheStatCard label="Active (Valid)" value={stats.nytCache.activeEntries} color="#059669" />
            <CacheStatCard label="Expired" value={stats.nytCache.expiredEntries} color="#d97706" />
          </div>
        </div>
      )}

      {/* Quick links */}
      <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-ink)' }}>
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { href: '/admin/articles',   title: 'Manage Articles',   desc: 'Create, edit, and delete articles', icon: FileText, color: '#326891' },
          { href: '/admin/categories', title: 'Manage Categories', desc: 'Add or modify content categories', icon: FileText, color: '#059669' },
          { href: '/admin/users',      title: 'Manage Users',      desc: 'View, lock, or remove user accounts', icon: Users, color: '#7c3aed' },
          { href: '/admin/comments',   title: 'Moderate Comments', desc: 'Review and delete inappropriate comments', icon: MessageSquare, color: '#d97706' },
        ].map(item => (
          <a
            key={item.href}
            href={item.href}
            className="bg-white p-5 rounded-sm shadow-sm hover:shadow-md transition-all block group"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + '12' }}>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              <div>
                <p className="font-bold text-sm mb-0.5 group-hover:underline" style={{ color: 'var(--color-ink)' }}>{item.title}</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>{item.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
