"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import PaywallModal from "@/app/studio/_components/PaywallModal";

export default function Sidebar({ isOpen, onClose, subscription }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isPaid, creditsRemaining, creditsResetAt } = subscription ?? {};
  const [userEmail, setUserEmail] = useState(null);
  const [businessType, setBusinessType] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fashiq_business_type") || null;
    }
    return null;
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setUserEmail(data?.user?.email ?? null);
      if (data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("business_type")
          .eq("id", data.user.id)
          .single();
        if (profile?.business_type) {
          setBusinessType(profile.business_type);
          if (typeof window !== "undefined") {
            localStorage.setItem("fashiq_business_type", profile.business_type);
          }
        }
      }
    });
  }, []);

  // Determine active studio
  const activeStudio = businessType || (pathname?.includes("jewelry") ? "jewelry" : "clothing");
  const studioLabel = activeStudio === "jewelry" ? "Jewellery Studio" : "Clothing Studio";
  const studioHref = `/studio/${activeStudio}`;
  const isStudioActive = pathname?.startsWith("/studio");

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  const handleUpgrade = async (plan) => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Checkout failed. Please try again.");
      return;
    }
    const { checkout_url } = await res.json();
    window.location.href = checkout_url;
  };

  return (
    <>
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
        context="free"
        creditsResetAt={creditsResetAt}
      />

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

            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link href={studioHref} onClick={onClose} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                textDecoration: 'none', 
                color: isStudioActive ? 'var(--foreground)' : 'var(--muted)', 
                fontWeight: isStudioActive ? '600' : '400',
                fontSize: '0.95rem',
                transition: 'color 0.2s',
                flex: 1
              }}>
                {activeStudio === "jewelry" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="6 3 18 3 22 9 12 22 2 9"></polygon>
                    <line x1="2" y1="9" x2="22" y2="9"></line>
                    <line x1="12" y1="22" x2="7.5" y2="9"></line>
                    <line x1="12" y1="22" x2="16.5" y2="9"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
                  </svg>
                )}
                {studioLabel}
              </Link>

              {/* Three dots to change studio */}
              <Link
                href="/onboarding"
                onClick={onClose}
                title="Change Studio (Clothing / Jewellery)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '0.5rem',
                  color: 'var(--muted)',
                  textDecoration: 'none',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s',
                  marginLeft: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = 'var(--foreground)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'var(--muted)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </Link>
            </li>

            <li>
              <Link href="/personas" onClick={onClose} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                textDecoration: 'none', 
                color: pathname === '/personas' ? 'var(--foreground)' : 'var(--muted)',
                fontWeight: pathname === '/personas' ? '600' : '400',
                fontSize: '0.95rem',
                transition: 'color 0.2s'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Model Persona
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

        {/* Premium Upgrade for Free Users */}
        {!isPaid && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => setShowPaywall(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--accent) 0%, #a3e635 100%)',
                color: '#000',
                border: 'none',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '0 4px 15px rgba(190,242,100,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(190,242,100,0.4)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(190,242,100,0.3)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              Upgrade to Premium
            </button>
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
