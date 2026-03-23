'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional: redirect URL when not authenticated (defaults to /auth/login) */
  redirectTo?: string;
}

/**
 * Wraps any page that requires an authenticated user.
 * Redirects to login if not authenticated after initial load.
 */
export default function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [loading, user, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-paper-warm)' }}>
        <div className="text-center">
          <Loader2 size={32} className="mx-auto mb-3 animate-spin" style={{ color: 'var(--color-link)' }} />
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Verifying authentication…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Render nothing while redirecting
    return null;
  }

  return <>{children}</>;
}
