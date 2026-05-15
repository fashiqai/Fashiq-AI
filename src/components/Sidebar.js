"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Sidebar({ isOpen, onClose, subscription }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isPaid, creditsRemaining, creditsResetAt } = subscription ?? {};
  const [userEmail, setUserEmail] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data?.user?.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

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
            Fashiq <span style={{ fontStyle: 'italic', opacity: 0.5 }}>AI</span>
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
        {isPaid && (
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
            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--accent)', lineHeight: 1 }}>
              {creditsRemaining}
            </div>
            {creditsResetAt && (
              <div style={{ fontSize: '0.65rem', opacity: 0.35, marginTop: '0.3rem' }}>
                Resets {new Date(creditsResetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        )}

        {/* Account / Logout */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '0.9rem',
            color: 'var(--foreground)',
            opacity: 0.85,
            marginBottom: '0.85rem',
            wordBreak: 'break-all',
            lineHeight: 1.3,
          }}>
            {userEmail ?? '—'}
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid rgba(255, 77, 79, 0.5)',
              borderRadius: '0.5rem',
              color: '#ff4d4f',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: isLoggingOut ? 'default' : 'pointer',
              opacity: isLoggingOut ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'opacity 0.2s, background 0.2s, border-color 0.2s',
            }}
            onMouseOver={(e) => { if (!isLoggingOut) { e.currentTarget.style.background = 'rgba(255, 77, 79, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 77, 79, 0.8)'; } }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 77, 79, 0.5)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {isLoggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </div>

        {/* Footer Info */}
        <div style={{ fontSize: '0.7rem', opacity: 0.3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          © 2026 Fashiq AI Studio
        </div>
      </aside>
    </>
  );
}
