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

        <div className="history-page animate-up" style={{ maxWidth: '1200px' }}>
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
              <div key={gen.id} className="history-item">
                <div className="history-image-wrap" style={{ aspectRatio: '3/4', background: 'var(--background)', position: 'relative' }}>
                  {gen.status === 'completed' ? (
                    <>
                      <img
                        src={gen.output_image_url}
                        alt="AI Result"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{ display: 'none', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '2rem', opacity: 0.4 }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                        <p style={{ fontSize: '0.75rem' }}>Image expired</p>
                      </div>
                      <button
                        onClick={() => handleDownloadClick(gen.output_image_url)}
                        aria-label="Download image"
                        className="history-download-btn"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </button>
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
                {gen.config?.productDescription && (
                  <div className="history-caption">
                    <span>{gen.config.productDescription}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

          .history-page {
            padding: 4rem 2rem;
          }
          @media (max-width: 768px) {
            .history-page { padding: 1rem 0.75rem 3rem; }
          }

          .history-item {
            transition: transform 0.3s ease;
          }
          .history-item:hover { transform: translateY(-5px); }

          .history-image-wrap {
            border-radius: 1.25rem;
            overflow: hidden;
            border: 1px solid var(--border);
          }

          .history-download-btn {
            position: absolute;
            bottom: 0.75rem;
            right: 0.75rem;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent);
            color: #000;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
            transition: transform 0.15s ease, opacity 0.15s ease;
          }
          .history-download-btn:hover { transform: scale(1.05); }
          .history-download-btn:active { transform: scale(0.95); }

          .history-caption {
            padding: 0.6rem 0.25rem 0;
            font-size: 0.8rem;
            color: var(--foreground);
            opacity: 0.85;
            word-break: break-word;
            line-height: 1.35;
          }

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
              gap: 0.75rem;
            }
            .history-image-wrap { border-radius: 1rem; }
            .history-download-btn {
              width: 36px;
              height: 36px;
              bottom: 0.5rem;
              right: 0.5rem;
            }
            .history-caption {
              font-size: 0.75rem;
              padding: 0.5rem 0.15rem 0;
            }
          }
        `}</style>
        </div>
      </main>
    </div>
  );
}
