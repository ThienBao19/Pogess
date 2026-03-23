'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps pages that require the 'admin' role.
 * Non-admins see a forbidden message, unauthenticated users redirect to login.
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-paper-warm)' }}>
        <div className="text-center">
          <Loader2 size={32} className="mx-auto mb-3 animate-spin" style={{ color: 'var(--color-link)' }} />
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Verifying access…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-paper-warm)' }}>
        <div className="text-center max-w-md mx-auto px-4">
          <ShieldAlert size={48} className="mx-auto mb-4" style={{ color: 'var(--color-accent)' }} />
          <h1 className="font-serif font-bold text-2xl mb-2" style={{ color: 'var(--color-ink)' }}>
            Access Denied
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-ink-muted)' }}>
            You don&apos;t have permission to view this page. Admin access is required.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
