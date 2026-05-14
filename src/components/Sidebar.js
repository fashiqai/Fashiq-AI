"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ isOpen, onClose, subscription }) {
  const pathname = usePathname();
  const { isPaid, creditsRemaining, creditsLimit, creditsResetAt } = subscription ?? {};

  return (
    <>
      {/* Mobile Overlay */}
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>

      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        {/* Close Button for Mobile */}
        <button className="close-sidebar-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* Brand Heading */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '1.8rem', 
            fontWeight: '400',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Fashion <span style={{ fontStyle: 'italic', opacity: 0.5 }}>AI</span>
          </h2>
          <div style={{ width: '30px', height: '2px', background: 'var(--accent)', marginTop: '0.5rem' }}></div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <li>
              <Link href="/history" onClick={onClose} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                textDecoration: 'none', 
                color: pathname === '/history' ? 'var(--foreground)' : 'var(--muted)',
                fontWeight: pathname === '/history' ? '600' : '400',
                fontSize: '0.95rem',
                transition: 'color 0.2s'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                View History
              </Link>
            </li>

            <li>
              <Link href="/onboarding" onClick={onClose} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                textDecoration: 'none', 
                color: 'var(--muted)', 
                fontSize: '0.95rem',
                transition: 'color 0.2s'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 2.1l4 4-4 4"></path>
                  <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8"></path>
                  <path d="M7 22.3l-4-4 4-4"></path>
                  <path d="M21 12.2v2a4 4 0 0 1-4 4H8.2"></path>
                </svg>
                Switch Studio
              </Link>
            </li>

          </ul>
        </nav>

        {/* Credits display for paid users */}
        {isPaid && creditsLimit > 0 && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.4rem' }}>
              Credits
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--accent)', lineHeight: 1 }}>
                {creditsRemaining}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', opacity: 0.5 }}>
                / {creditsLimit}
              </span>
            </div>
            {creditsResetAt && (
              <div style={{ fontSize: '0.65rem', opacity: 0.35, marginTop: '0.3rem' }}>
                Resets {new Date(creditsResetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div style={{ fontSize: '0.7rem', opacity: 0.3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          © 2026 Fashion AI Studio
        </div>
      </aside>
    </>
  );
}
