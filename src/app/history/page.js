"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Sidebar from "@/components/Sidebar";

export default function HistoryPage() {
  const [generations, setGenerations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const supabase = createClient();

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

  return (
    <div className="studio-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="studio-content-wrapper">
        {/* Mobile Nav Trigger */}
        <header className="mobile-studio-nav">
          <Link href="/" className="nav-brand" style={{ fontSize: '1.2rem' }}>
            Fashion <span className="brand-italic">AI</span>
          </Link>
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </header>

        <div className="history-page animate-up" style={{ padding: '4rem 2rem', maxWidth: '1200px' }}>
          <header style={{ marginBottom: '4rem' }}>
          <p style={{ letterSpacing: '0.2em', opacity: 0.4 }}>GALLERY</p>
          <h1 style={{ fontSize: '3rem', fontFamily: "'Playfair Display', serif" }}>My Photoshoots</h1>
          <p style={{ opacity: 0.6 }}>Your permanent collection of AI-transformed fashion.</p>
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
          <div className="history-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.3 }}>
                      {gen.config?.business_type || 'Fashion'} • {gen.config?.pose || 'Standard'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                     {gen.status === 'completed' && (
                       <a 
                         href={gen.output_image_url} 
                         download 
                         target="_blank"
                         style={{ 
                           flex: 1, 
                           textAlign: 'center', 
                           padding: '0.75rem', 
                           background: 'var(--accent)', 
                           color: '#000', 
                           borderRadius: '0.75rem', 
                           fontSize: '0.8rem', 
                           textDecoration: 'none',
                           fontWeight: '700'
                         }}
                       >
                         Download
                       </a>
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
        `}</style>
        </div>
      </main>
    </div>
  );
}
