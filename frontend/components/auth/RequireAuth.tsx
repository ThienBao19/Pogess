'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  /** Allowed roles. If empty, any authenticated user is allowed. */
  roles?: Array<'user' | 'admin'>;
  /** Where to redirect unauthenticated users. Defaults to /auth/login */
  redirectTo?: string;
}

/**
 * Route guard component.
 *
 * Usage:
 *   <RequireAuth>              — any logged-in user
 *   <RequireAuth roles={['admin']}>  — admin only
 */
export default function RequireAuth({
  children,
  roles = [],
  redirectTo = '/auth/login',
}: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not authenticated → redirect to login
    if (!user) {
      router.replace(redirectTo);
      return;
    }

    // Role check: if specific roles are required and user doesn't have one → redirect
    if (roles.length > 0 && !roles.includes(user.role)) {
      router.replace('/');
      return;
    }
  }, [user, loading, roles, redirectTo, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center" style={{ color: 'var(--color-ink-muted)' }}>
          <Loader2 size={28} className="mx-auto mb-3 animate-spin" />
          <p className="text-sm">Checking authentication…</p>
        </div>
      </div>
    );
  }

  // Not authorized — render nothing while redirect happens
  if (!user) return null;
  if (roles.length > 0 && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
