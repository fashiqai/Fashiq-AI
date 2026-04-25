"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function ClothingStudio() {
  // File & Preview State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [resultImage, setResultImage] = useState(null);

  // Configuration State
  const [config, setConfig] = useState({
    gender: null, // Start with no gender selected
    identity: "Western",
    pose: "Front",
    background: "Indoor"
  });

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
      // 1. Start the generation
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garment_image: preview,
          business_type: "clothing",
          ...config
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      
      <div className="studio-page animate-up" style={{ flex: 1, marginLeft: '280px', padding: '4rem' }}>
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
              <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '320px' }}>
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <div className="rounded-box" style={{ position: 'absolute', bottom: '2rem', right: '2rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>CHANGE IMAGE</div>
              </div>
            )}

            {/* Generating State */}
            {isGenerating && (
              <div style={{ padding: '4rem', textAlign: 'center', width: '100%' }}>
                <div className="loader" style={{ marginBottom: '2rem' }}>🎨</div>
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>{statusMessage}</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '1rem' }}>This usually takes about 25-40 seconds. Do not refresh.</p>
              </div>
            )}

            {/* Final Result Image (No Buttons Inside) */}
            {resultImage && !isGenerating && (
              <div style={{ width: '100%', height: '100%', minHeight: '320px' }}>
                <img src={resultImage} alt="AI Result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </section>

          {/* Independent Action Shelf (Outside the Card) */}
          {resultImage && !isGenerating && (
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', width: '100%', animation: 'fadeIn 0.5s ease' }}>
              <button
                onClick={async () => {
                  const response = await fetch(resultImage);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `fasionai-photoshoot-${Date.now()}.png`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                }}
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
                        <div className="pose-thumb">
                          <img
                            src={p.thumb}
                            alt={p.label}
                            onError={(e) => { e.target.src = '/poses/female/front.png'; }} // Fallback for stability
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

        <style jsx>{`
          .loader {
            font-size: 3rem;
            animation: pulse 1s infinite alternate;
          }
          @keyframes pulse { to { transform: scale(1.2); opacity: 0.5; } }
        `}</style>
      </div>
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
