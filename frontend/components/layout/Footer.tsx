import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-16 py-10 px-4 text-center"
      style={{ borderTop: '3px solid var(--color-ink)', backgroundColor: 'var(--color-paper-warm)' }}
    >
      <p
        className="article-headline mb-4"
        style={{ fontSize: '1.75rem', color: 'var(--color-ink)' }}
      >
        The Daily Press
      </p>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
        {[
          { label: 'Home', href: '/' },
          { label: 'Current Affairs', href: '/category/current-affairs' },
          { label: 'Technology', href: '/category/technology' },
          { label: 'Sports', href: '/category/sports' },
          { label: 'Entertainment', href: '/category/entertainment' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs uppercase font-semibold tracking-wider hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.07em' }}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)' }}>
        © {year} The Daily Press. Powered by the New York Times API.
      </p>
    </footer>
  );
}
