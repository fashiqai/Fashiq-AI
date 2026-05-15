"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import PremiumLoader from "@/app/components/PremiumLoader";
import { compressImage } from "@/utils/imageCompression";
import { useSubscription } from "@/hooks/useSubscription";
import PaywallModal from "@/app/studio/_components/PaywallModal";

export default function ClothingStudio() {
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
    gender: null, // Start with no gender selected
    identity: "Western",
    pose: "Front",
    background: "Indoor"
  });

  // Show success banner when payment completes and subscription is active
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
    a.download = `fasionai-photoshoot-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Preload poses to eliminate UI lag
  useEffect(() => {
    const preloadImages = () => {
      const poses = ["front", "side", "back", "walking", "sitting", "leaning", "hips", "closeup_full", "closeup_half"];
      poses.forEach(pose => {
        const imgF = new window.Image();
        imgF.src = `/poses/female/${pose}.png`;
        const imgM = new window.Image();
        imgM.src = `/poses/male/${pose}.png`;
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
    if (!preview) return alert("Please upload a garment first.");
    if (!config.gender) return alert("Please select a target gender first.");

    setIsGenerating(true);
    setStatusMessage("KICKING OFF AI PROCESS...");
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
          business_type: "clothing",
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
          setResultImage(statusData.output[0]); // Result is typically an array of URLs
          return;
        }

        if (statusData.status === "failed") {
          throw new Error("AI Generation Failed. Please try again.");
        }

        // Keep polling every 3 seconds
        setStatusMessage(`GENERATING... [${statusData.status?.toUpperCase() || 'QUEUED'}]`);
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
          <p style={{ letterSpacing: '0.2em', opacity: 0.4 }}>AI STUDIO</p>
          <h1 style={{ fontSize: '3rem', fontFamily: "'Playfair Display', serif", marginBottom: '1rem' }}>Clothing Photoshoot</h1>
          <p style={{ opacity: 0.6, maxWidth: '600px', margin: '0 auto', letterSpacing: 'normal', textTransform: 'none' }}>
            Upload your garment and transform it into a professional editorial shot.
          </p>
        </header>

        {/* Main Studio Console */}
        <div className="studio-console" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>

          {/* Upload/Result Card */}
          <section
            className="upload-card"
            style={{
              ...(preview || resultImage ? { border: 'none', padding: 0, overflow: 'hidden' } : {}),
              position: 'relative',
              width: '100%',
              maxWidth: '540px'
            }}
          >
            <label
              htmlFor="clothing-upload"
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
              id="clothing-upload"
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

            {/* Default: No Image */}
            {!preview && !resultImage && !isGenerating && (
              <>
                <div className="upload-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <div className="upload-text">
                  <h3>UPLOAD SOURCE GARMENT</h3>
                  <p>Drag and drop or select high-res photo</p>
                </div>
              </>
            )}

            {/* Preview State */}
            {preview && !resultImage && !isGenerating && (
              <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '320px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}

            {/* Generating State */}
            {isGenerating && (
              <PremiumLoader preview={preview} status={statusMessage} />
            )}

            {/* Final Result Image (No Buttons Inside) */}
            {resultImage && !isGenerating && (
              <div style={{ width: '100%', height: '100%', minHeight: '320px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <img src={resultImage} alt="AI Result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </section>

          {/* Change Image Trigger (Below Card) */}
          {preview && !resultImage && !isGenerating && (
            <div style={{ width: '100%', maxWidth: '540px', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <label 
                htmlFor="clothing-upload" 
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

          {/* Independent Action Shelf (Outside the Card) */}
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
                NEW PRODUCT
              </button>
            </div>
          )}

          {/* Configuration Shelves */}
          {!isGenerating && !resultImage && (
            <div className="selection-grid" style={{ marginTop: '2rem', width: '100%', maxWidth: '540px' }}>
              <ConfigSection label="Gender Target" value={config.gender} options={["Female", "Male"]} onUpdate={v => updateConfig('gender', v)} />
              <ConfigSection label="Model Identity" value={config.identity} options={["Western", "Indian"]} onUpdate={v => updateConfig('identity', v)} />

              {/* 3x3 Visual Pose Grid (Condition: Only show if Gender is selected) */}
              {config.gender && (
                <div className="selection-group">
                  <h4 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Pose Selection</h4>
                  <div className="pose-grid">
                    {[
                      { id: "Front", label: "Front", thumb: `/poses/${config.gender.toLowerCase()}/front.png` },
                      { id: "Side View", label: "Side View", thumb: `/poses/${config.gender.toLowerCase()}/side.png` },
                      { id: "Back", label: "Back", thumb: `/poses/${config.gender.toLowerCase()}/back.png` },
                      { id: "Walking", label: "Walking", thumb: `/poses/${config.gender.toLowerCase()}/walking.png` },
                      { id: "Sitting", label: "Sitting", thumb: `/poses/${config.gender.toLowerCase()}/sitting.png` },
                      { id: "Leaning", label: "Leaning", thumb: `/poses/${config.gender.toLowerCase()}/leaning.png` },
                      { id: "Hands on Hips", label: "Hips-On", thumb: `/poses/${config.gender.toLowerCase()}/hips.png` },
                      { id: "Close up (Full)", label: "Close-Up", thumb: `/poses/${config.gender.toLowerCase()}/closeup_full.png` },
                      { id: "Close up (Half Face)", label: "Focus On Cloth", thumb: `/poses/${config.gender.toLowerCase()}/closeup_half.png` },
                    ].map(p => (
                      <div
                        key={p.id}
                        className={`pose-card ${config.pose === p.id ? 'active' : ''}`}
                        onClick={() => updateConfig('pose', p.id)}
                      >
                        <div className="pose-thumb" style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <Image
                            src={p.thumb}
                            alt={p.label}
                            fill
                            sizes="(max-width: 600px) 45vw, 15vw"
                            style={{ objectFit: 'cover' }}
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // simple transparent fallback
                          />
                        </div>
                        <span className="pose-label">{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Background at the Bottom */}
              <ConfigSection label="Background Essence" value={config.background} options={["Indoor", "Outdoor"]} onUpdate={v => updateConfig('background', v)} />
            </div>
          )}

          {/* Generate Trigger */}
          {!isGenerating && !resultImage && preview && (
            <button className="generate-btn" onClick={generatePhotoshoot} style={{ width: '100%', marginTop: '4rem' }}>
              Transform Garment
            </button>
          )}
        </div>

        </div>
      </main>
    </div>
  );
}

function ConfigSection({ label, value, options, onUpdate }) {
  return (
    <div className="selection-group">
      <h4>{label}</h4>
      <div className="pill-container">
        {options.map(opt => (
          <button
            key={opt}
            className={`rounded-box ${value === opt ? 'active' : ''}`}
            onClick={() => onUpdate(opt)}
          >{opt}</button>
        ))}
      </div>
    </div>
  );
}
