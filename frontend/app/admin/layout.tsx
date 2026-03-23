'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AdminRoute from '@/components/auth/AdminRoute';
import {
  LayoutDashboard, FileText, Tag, Users,
  MessageSquare, LogOut, Newspaper,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin',            label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/articles',   label: 'Articles',   icon: FileText },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/users',      label: 'Users',      icon: Users },
  { href: '/admin/comments',   label: 'Comments',   icon: MessageSquare },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="admin-sidebar flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Newspaper size={20} className="opacity-80" />
            <span className="font-bold text-sm tracking-wide">Admin Panel</span>
          </div>
          <p className="text-xs mt-1 opacity-50">The Daily Press</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-6 py-3 text-sm transition-colors"
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? '3px solid white' : '3px solid transparent',
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-xs opacity-50 mb-3">{user?.name}</p>
          <button
            onClick={() => { signOut(); router.push('/'); }}
            className="flex items-center gap-2 text-sm opacity-65 hover:opacity-100 transition-opacity"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#f8f9fb' }}>
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminRoute>
  );
}
