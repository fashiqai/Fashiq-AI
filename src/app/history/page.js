"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Sidebar from "@/components/Sidebar";
import { useSubscription } from "@/hooks/useSubscription";
import PaywallModal from "@/app/studio/_components/PaywallModal";

export default function HistoryPage() {
  const [generations, setGenerations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const supabase = createClient();

  const { isPaid, creditsResetAt } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        setGenerations(data);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, []);

  const handleDownloadClick = (imageUrl) => {
    if (!isPaid) {
      setShowPaywall(true);
      return;
    }
    // History downloads don't consume credits — credit was spent at generation time
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `fasionai-${Date.now()}.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="studio-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={async (plan) => {
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
        }}
        context="free"
        creditsResetAt={creditsResetAt}
      />
      
      <main className="studio-content-wrapper">
        {/* Mobile Nav Trigger */}
        <header className="mobile-studio-nav">
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
          <Link href="/" className="nav-brand" style={{ fontSize: '1.2rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
            Fashiq <span className="brand-italic">AI</span>
          </Link>
          <div style={{ flex: 1 }} />
        </header>

        <div className="history-page animate-up" style={{ padding: '4rem 2rem', maxWidth: '1200px' }}>
          <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", marginBottom: '0.5rem' }}>Your Photoshoots</h1>
          <p style={{ opacity: 0.6 }}>Your collection of AI photoshoots</p>
        </header>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '10rem 0', opacity: 0.5 }}>
            Loading your gallery...
          </div>
        ) : generations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '10rem 0', background: 'var(--surface)', borderRadius: '2rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
            <h3>Your gallery is empty</h3>
            <p style={{ opacity: 0.5 }}>Start creating in the studio to see your work here.</p>
          </div>
        ) : (
          <div className="history-grid">
            {generations.map((gen) => (
              <div key={gen.id} className="history-item" style={{
                background: 'var(--surface)',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
                transition: 'transform 0.3s ease',
                border: '1px solid var(--border)'
              }}>
                <div style={{ aspectRatio: '3/4', background: 'var(--background)', position: 'relative' }}>
                  {gen.status === 'completed' ? (
                    <>
                      <img
                        src={gen.output_image_url}
                        alt="AI Result"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{ display: 'none', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '2rem', opacity: 0.4 }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                        <p style={{ fontSize: '0.75rem' }}>Image expired</p>
                      </div>
                    </>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                      <div>
                        <div style={{ animation: 'spin 2s linear infinite' }}>⏳</div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '1rem' }}>Processing...</p>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {gen.config?.productDescription && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.85, wordBreak: 'break-word' }}>
                        {gen.config.productDescription}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                     {gen.status === 'completed' && (
                       <button
                         onClick={() => handleDownloadClick(gen.output_image_url)}
                         style={{
                           flex: 1,
                           textAlign: 'center',
                           padding: '0.75rem',
                           background: 'var(--accent)',
                           color: '#000',
                           borderRadius: '0.75rem',
                           fontSize: '0.8rem',
                           fontWeight: '700',
                           border: 'none',
                           cursor: 'pointer',
                         }}
                       >
                         Download
                       </button>
                     )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .history-item:hover { transform: translateY(-5px); }

          .history-grid {
            display: grid;
            gap: 1.5rem;
            grid-template-columns: repeat(4, 1fr);
          }
          @media (max-width: 1024px) {
            .history-grid { grid-template-columns: repeat(3, 1fr); }
          }
          @media (max-width: 768px) {
            .history-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 1.25rem;
            }
          }
        `}</style>
        </div>
      </main>
    </div>
  );
}
