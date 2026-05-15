"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import PremiumLoader from "@/app/components/PremiumLoader";
import { compressImage } from "@/utils/imageCompression";
import { useSubscription } from "@/hooks/useSubscription";
import PaywallModal from "@/app/studio/_components/PaywallModal";

export default function JewelryStudio() {
  // File & Preview State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [resultImage, setResultImage] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Subscription / paywall
  const { isPaid, blockReason, creditsRemaining, creditsResetAt, refresh } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallContext, setPaywallContext] = useState("free");
  const [paymentBanner, setPaymentBanner] = useState(false);
  const [config, setConfig] = useState({
    gender: "Female",
    jewelryType: "Auto", // Default type
    style: "Auto", // Default starting style
    productDescription: "",
  });

  const JEWELRY_DATA = {
    "Auto": { styles: [] },
    "Necklace": {
      styles: [
        { id: "Editorial High-Fashion", label: "Editorial", sub: "Full face & portrait", image: "/styles/jewelry/necklace/necklace-1.png" },
        { id: "Cinematic Half-Cut", label: "Cinematic", sub: "Half-face close-up", image: "/styles/jewelry/necklace/necklace-2.png" },
        { id: "Luminous Detail", label: "Luminous", sub: "Macro product focus", image: "/styles/jewelry/necklace/necklace-3.png" },
      ]
    },
    "Earrings": {
      styles: [
        { id: "Editorial Earring", label: "Editorial", sub: "Full face & portrait", image: "/styles/jewelry/earring/earring-1.png" },
        { id: "Macro Ear", label: "Macro Detail", sub: "Close-up focus", image: "/styles/jewelry/earring/earring-2.png" },
      ]
    },
    "Ring on finger": {
      styles: [
        { id: "Classic Editorial Ring", label: "Classic Editorial", sub: "Elegant hand-to-face", image: "/styles/jewelry/ring/ring-1.png" },
        { id: "Cinematic Glow Ring", label: "Cinematic Glow", sub: "Warm editorial focus", image: "/styles/jewelry/ring/ring-2.png" },
        { id: "Minimalist Product Ring", label: "Minimalist Product", sub: "Clean fabric backdrop", image: "/styles/jewelry/ring/ring-3.png" },
        { id: "Graceful Portrait Ring", label: "Graceful Portrait", sub: "Tighter cinematic crop", image: "/styles/jewelry/ring/ring-4.png" },
        { id: "Soft Macro Ring", label: "Soft Macro", sub: "Product-first hand shot", image: "/styles/jewelry/ring/ring-5.png" },
        { id: "Artistic Stance Ring", label: "Artistic Stance", sub: "Dynamic hand pose", image: "/styles/jewelry/ring/ring-6.png" },
      ]
    }
  };

  // Show success banner when payment completes
  useEffect(() => {
    if (isPaid && paymentBanner) {
      const t = setTimeout(() => setPaymentBanner(false), 5000);
      return () => clearTimeout(t);
    }
  }, [isPaid, paymentBanner]);

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
    setPaymentBanner(true);
    window.location.href = checkout_url;
  };

  const handleDownloadClick = async () => {
    if (!isPaid) {
      setPaywallContext("free");
      setShowPaywall(true);
      return;
    }
    if (creditsRemaining <= 0) {
      setPaywallContext("no_credits");
      setShowPaywall(true);
      return;
    }
    const response = await fetch(resultImage);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fasionai-jewelry-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Preload jewelry styles to eliminate UI lag
  useEffect(() => {
    const preloadImages = () => {
      Object.values(JEWELRY_DATA).forEach(typeData => {
        if (typeData.styles) {
          typeData.styles.forEach(style => {
            if (style.image) {
              const img = new window.Image();
              img.src = style.image;
            }
          });
        }
      });
    };

    // Defer preloading slightly to prioritize main render
    if (typeof window !== "undefined") {
      setTimeout(preloadImages, 1000);
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  // The Magic Generation Logic (Polling Architecture)
  const generatePhotoshoot = async () => {
    if (!preview) return alert("Please upload a jewelry image first.");

    setIsGenerating(true);
    setStatusMessage("CRAFTING LUXURY RENDER...");
    setResultImage(null);

    try {
      // 1. Compress Image before sending to avoid "Request Entity Too Large"
      const compressedImage = await compressImage(preview);

      // 2. Start the generation
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garment_image: compressedImage,
          business_type: "jewelry",
          ...config
        }),
      });

      // Handle non-JSON errors (like "Request Entity Too Large" text from server)
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await res.text();
        throw new Error(textError.includes("too large") ? "Image size too large for the server. Try a smaller image." : "Server error. Please try again.");
      }

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "upgrade_required" || data.error === "no_credits") {
          setIsGenerating(false);
          setPaywallContext(data.error === "no_credits" ? "no_credits" : "free");
          setShowPaywall(true);
          return;
        }
        throw new Error(data.error || "Generation error");
      }

      // 2. Start the Polling Loop
      const poll = async (predictionId) => {
        const checkRes = await fetch(`/api/status?id=${predictionId}`);
        const statusData = await checkRes.json();

        if (statusData.status === "completed") {
          setIsGenerating(false);
          setResultImage(statusData.output[0]);
          return;
        }

        if (statusData.status === "failed") {
          throw new Error("AI Generation Failed. Please try again.");
        }

        setStatusMessage(`CRAFTING... [${statusData.status?.toUpperCase() || 'QUEUED'}]`);
        setTimeout(() => poll(predictionId), 3000);
      };

      await poll(data.id);

    } catch (err) {
      console.error(err);
      alert(err.message);
      setIsGenerating(false);
    }
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="studio-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} subscription={{ isPaid, creditsRemaining, creditsResetAt }} />

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
        context={paywallContext}
        creditsResetAt={creditsResetAt}
      />

      {paymentBanner && isPaid && (
        <div style={{
          position: "fixed", top: "1rem", left: "50%", transform: "translateX(-50%)",
          zIndex: 4000, background: "var(--accent)", color: "#000",
          padding: "0.75rem 2rem", borderRadius: "2rem",
          fontWeight: "700", fontSize: "0.85rem", letterSpacing: "0.05em",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "fadeIn 0.3s ease",
        }}>
          Payment confirmed — you have {creditsRemaining} credits!
        </div>
      )}

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

        <div className="studio-page animate-up">
          <header className="header" style={{ marginBottom: '5rem', textAlign: 'center' }}>
            <p style={{ letterSpacing: '0.2em', opacity: 0.4 }}>LUXURY STUDIO</p>
            <h1 style={{ fontSize: '3rem', fontFamily: "'Playfair Display', serif", marginBottom: '1rem' }}>Jewelry Showcase</h1>
            <p style={{ opacity: 0.6, maxWidth: '600px', margin: '0 auto', letterSpacing: 'normal', textTransform: 'none' }}>
              Hero-focused AI imagery for high-end ornaments and accessories.
            </p>
          </header>

          <div className="studio-console" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>

            <section
              className="upload-card"
              style={{
                ...(preview || resultImage ? { border: 'none', padding: 0, overflow: 'hidden' } : {}),
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                minHeight: '280px',
                border: '2px dotted var(--accent)', // Fixed thicker yellow/accent dotted border
                boxShadow: '0 0 15px rgba(190, 242, 100, 0.1)'
              }}
            >
              <label
                htmlFor="jewelry-upload"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  zIndex: 10,
                  display: (resultImage || isGenerating) ? 'none' : 'block'
                }}
              />
              <input
                id="jewelry-upload"
                type="file"
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: '0',
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  borderWidth: '0',
                  opacity: 0
                }}
                accept="image/*"
                onChange={handleFileChange}
                disabled={isGenerating || !!resultImage}
              />

              {!preview && !resultImage && !isGenerating && (
                <>
                  <div className="upload-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>
                  <div className="upload-text">
                    <h3>UPLOAD JEWELLERY PIECE</h3>
                    <p>Necklaces, Earrings, Rings or Bracelets</p>
                  </div>
                </>
              )}

              {preview && !resultImage && !isGenerating && (
                <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '280px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}

              {/* Generating State */}
              {isGenerating && (
                <PremiumLoader preview={preview} status={statusMessage} />
              )}

              {resultImage && !isGenerating && (
                <div style={{ width: '100%', height: '100%', minHeight: '280px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <img src={resultImage} alt="AI Result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </section>

            {/* Change Image Trigger (Below Card) */}
            {preview && !resultImage && !isGenerating && (
              <div style={{ width: '100%', maxWidth: '460px', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <label
                  htmlFor="jewelry-upload"
                  className="rounded-box"
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    opacity: 0.8
                  }}
                >
                  CHANGE IMAGE
                </label>
              </div>
            )}

            {resultImage && !isGenerating && (
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', width: '100%', animation: 'fadeIn 0.5s ease' }}>
                <button
                  onClick={handleDownloadClick}
                  className="rounded-box"
                  style={{ backgroundColor: 'var(--accent)', color: '#000', padding: '1.25rem 3rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(255,255,255,0.1)', fontWeight: '700' }}
                >
                  DOWNLOAD SHOT
                </button>
                <button
                  onClick={() => { setResultImage(null); setFile(null); setPreview(null); }}
                  className={`rounded-box`}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem 3rem', cursor: 'pointer' }}
                >
                  NEW PIECE
                </button>
              </div>
            )}

            {!isGenerating && !resultImage && (
              <div className="selection-grid" style={{ marginTop: '2rem', width: '100%', maxWidth: '460px' }}>

                {/* 1. Product Description */}
                <div className="selection-group" style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', marginBottom: '0.75rem', color: '#fff' }}>PRODUCT DESCRIPTION</h4>
                  <div className="input-container" style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="rounded-box"
                      placeholder="SKU number or any specification of product"
                      value={config.productDescription}
                      onChange={(e) => updateConfig('productDescription', e.target.value)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: '3px solid rgba(255,255,255,0.18)', // Even thicker visible grey outline
                        color: 'var(--foreground)',
                        padding: '1rem 1.25rem',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>


                <ConfigSection
                  label="Model Gender"
                  value={config.gender}
                  options={["Female", "Male"]}
                  onUpdate={v => updateConfig('gender', v)}
                  gridColumns="repeat(2, 1fr)"
                />

                <ConfigSection
                  label="Jewellery Type"
                  value={config.jewelryType}
                  options={["Auto", "Necklace", "Earrings", "Ring on finger"]}
                  onUpdate={v => {
                    updateConfig('jewelryType', v);
                    updateConfig('style', v === 'Auto' ? 'Auto' : JEWELRY_DATA[v].styles[0].id);
                  }}
                  gridColumns="repeat(3, 1fr)"
                />


                {/* Show Model Style Grid */}
                {config.jewelryType !== "Auto" && (
                  <div className="selection-group" style={{ marginTop: '2rem', width: '100%' }}>
                    <h4 style={{ textAlign: 'left', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>Generation Style</h4>
                    <div className="pose-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: config.jewelryType === 'Necklace' ? 'repeat(3, 1fr)' : (config.jewelryType === 'Ring on finger' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'),
                      gap: '1.25rem'
                    }}>
                      {JEWELRY_DATA[config.jewelryType].styles.map(s => (
                        <div
                          key={s.id}
                          className="category-tile"
                          onClick={() => updateConfig('style', s.id)}
                          style={{
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <div className={`pose-card ${config.style === s.id ? 'active' : ''}`} style={{
                            width: '100%',
                            aspectRatio: '1/1',
                            borderRadius: '12px',
                            marginBottom: '1rem',
                            overflow: 'hidden',
                            position: 'relative',
                            padding: 0,
                            borderWidth: config.style === s.id ? '3px' : '1px'
                          }}>
                            {s.image ? (
                              <Image
                                src={s.image}
                                alt={s.label}
                                fill
                                sizes="(max-width: 600px) 45vw, 20vw"
                                style={{ objectFit: 'cover' }}
                                placeholder="blur"
                                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, backgroundColor: 'var(--background)' }}>STYLE</div>
                            )}
                          </div>
                          <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--foreground)',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            opacity: config.style === s.id ? 1 : 0.6
                          }}>
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isGenerating && !resultImage && preview && (
              <button className="generate-btn" onClick={generatePhotoshoot} style={{ width: '100%', marginTop: '4rem' }}>
                Generate Hero Shot
              </button>
            )}
          </div>

          <style jsx>{`
          
          .selection-group h4 {
            text-align: left !important;
            color: #ffffff !important; /* Pure white */
            opacity: 1 !important;
            font-size: 0.85rem !important;
          }

          .pill-container {
            justify-content: flex-start !important;
          }

          input::placeholder {
            color: var(--foreground);
            opacity: 0.3;
          }

          .photoshoot-card:hover {
            transform: translateY(-5px);
            border-color: var(--accent) !important;
          }

          .photoshoot-card.active {
            box-shadow: 0 0 20px rgba(var(--accent-rgb, 180, 255, 0), 0.2);
          }
        `}</style>
        </div>
      </main>
    </div>
  );
}

function ConfigSection({ label, value, options, onUpdate, gridColumns }) {
  return (
    <div className="selection-group" style={{ textAlign: 'left', width: '100%' }}>
      <h4 style={{ textAlign: 'left', marginBottom: '1.25rem', fontSize: '0.75rem', fontWeight: '600', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</h4>
      <div className="pill-container" style={{
        display: 'grid',
        gridTemplateColumns: gridColumns || 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '0.75rem'
      }}>
        {options.map(opt => (
          <button
            key={opt}
            className={`rounded-box ${value === opt ? 'active' : ''}`}
            onClick={() => onUpdate(opt)}
            style={{
              width: '100%',
              padding: '1.25rem 0.5rem',
              textAlign: 'center',
              borderRadius: '100px',
              fontSize: '0.95rem',
              fontWeight: '500',
              border: value === opt ? '3px solid var(--accent)' : '3px solid rgba(255,255,255,0.18)' // Even thicker grey/accent
            }}
          >{opt}</button>
        ))}
      </div>
    </div>
  );
}
