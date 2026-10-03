"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { compressImage } from "@/utils/imageCompression";
import { useSubscription } from "@/hooks/useSubscription";
import PaywallModal from "@/app/studio/_components/PaywallModal";

const LOCAL_STORAGE_KEY = "fashiq_model_personas";

// Attribute Options for AI Persona Studio
const ETHNICITIES = [
  "Western",
  "East Asian",
  "South Asian",
  "Black / Afro",
  "Latina / Hispanic",
  "Middle Eastern",
  "Scandinavian",
];

const AGE_RANGES = ["Early 20s", "Mid 20s", "30s", "40s"];

const HAIRSTYLES = [
  "Soft Waves",
  "Sleek Straight",
  "Textured Curls",
  "Chic Bob",
  "Pixie Cut",
  "Tied Back Ponytail",
];

const HAIR_COLORS = [
  "Dark Brown",
  "Deep Black",
  "Honey Blonde",
  "Auburn Red",
  "Platinum",
];

const EYE_COLORS = ["Brown", "Hazel", "Green", "Blue", "Amber"];

const VIBES = [
  "High-Fashion Editorial",
  "Natural Commercial",
  "Luxury Glamour",
  "Streetwear / Edge",
];

const EXPRESSIONS = [
  "Confident Neutral",
  "Subtle Warm Smile",
  "Editorial Gaze",
  "Poised & Serene",
];

export default function ModelPersonasPage() {
  // Page View Mode: "gallery" (Main sketch layout) | "create_ai" (Dedicated workspace)
  const [viewMode, setViewMode] = useState("gallery");

  // Personas State
  const [personas, setPersonas] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [previewPersona, setPreviewPersona] = useState(null);

  // Upload Naming Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingUploadName, setPendingUploadName] = useState("");

  // AI Persona Creator State
  const [aiForm, setAiForm] = useState({
    name: "Persona #1",
    gender: "Female",
    ethnicity: "Western",
    age: "Mid 20s",
    hairStyle: "Soft Waves",
    hairColor: "Dark Brown",
    eyeColor: "Brown",
    vibe: "High-Fashion Editorial",
    expression: "Confident Neutral",
    customPrompt: "",
    count: 2,
  });

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiCandidates, setAiCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [generationTimer, setGenerationTimer] = useState(0);

  const fileInputRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const subscription = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const [businessType, setBusinessType] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fashiq_business_type") || "clothing";
    }
    return "clothing";
  });

  // Load saved personas from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPersonas(parsed);
        setAiForm((prev) => ({ ...prev, name: `Persona #${parsed.length + 1}` }));
      }
    } catch (e) {
      console.error("Failed to load personas from localStorage:", e);
    }
  }, []);

  // Save personas to localStorage
  const savePersonas = (newPersonas) => {
    setPersonas(newPersonas);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPersonas));
    } catch (e) {
      console.error("Failed to save personas to localStorage:", e);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Upload Photo from Computer
  const handleFileChange = async (e) => {
    setShowUploadModal(false);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      showToast("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    // Determine the name: use user-entered name or fallback
    const modelName = pendingUploadName.trim() || `Model ${personas.length + 1}`;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const rawBase64 = reader.result;
          const compressedBase64 = await compressImage(rawBase64, 1200, 0.85);

          const newPersona = {
            id: `persona_${Date.now()}`,
            name: modelName,
            imageUrl: compressedBase64,
            source: "Uploaded",
            createdAt: new Date().toISOString(),
          };

          const updated = [newPersona, ...personas];
          savePersonas(updated);
          showToast(`"${modelName}" uploaded successfully!`);
        } catch (err) {
          console.error("Compression error:", err);
          showToast("Failed to process image. Please try another photo.");
        } finally {
          setIsUploading(false);
          setPendingUploadName("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error("Upload error:", err);
      setIsUploading(false);
      showToast("Error reading file.");
    }
  };

  const handleDeletePersona = (id, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this model persona?")) {
      const updated = personas.filter((p) => p.id !== id);
      savePersonas(updated);
      showToast("Model persona removed.");
      if (previewPersona?.id === id) setPreviewPersona(null);
    }
  };

  // AI Persona Generation Handler
  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    setAiCandidates([]);
    setSelectedCandidateId(null);
    setGenerationTimer(0);

    // Start timer counter
    timerIntervalRef.current = setInterval(() => {
      setGenerationTimer((t) => t + 1);
    }, 1000);

    try {
      const res = await fetch("/api/persona/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiForm),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Generation failed");
      }

      setAiCandidates(data.images);
      if (data.images?.length > 0) {
        setSelectedCandidateId(data.images[0].id);
      }
      showToast("AI Models generated! Choose your favorite face.");
    } catch (err) {
      console.error("AI Generation Error:", err);
      showToast(err.message || "Failed to generate AI model. Please try again.");
    } finally {
      clearInterval(timerIntervalRef.current);
      setIsGeneratingAi(false);
    }
  };

  // Save Selected Candidate as Persona
  const handleSaveSelectedAiPersona = async () => {
    const selected = aiCandidates.find((c) => c.id === selectedCandidateId);
    if (!selected) {
      showToast("Please select one of the generated faces first.");
      return;
    }

    try {
      // Compress for fast local storage & transmission
      const compressedUrl = await compressImage(selected.url, 1200, 0.85);

      const newPersona = {
        id: `persona_ai_${Date.now()}`,
        name: aiForm.name.trim() || `AI Persona #${personas.length + 1}`,
        imageUrl: compressedUrl,
        source: "AI Generated",
        attributes: { ...aiForm },
        createdAt: new Date().toISOString(),
      };

      const updated = [newPersona, ...personas];
      savePersonas(updated);
      showToast(`Saved "${newPersona.name}" to your model gallery!`);
      setViewMode("gallery"); // Smoothly switch back to main view
    } catch (e) {
      console.error("Error saving persona:", e);
      showToast("Could not save persona. Please try again.");
    }
  };

  return (
    <div className="studio-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} subscription={subscription} />

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={async (plan) => {
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan }),
          });
          if (res.ok) {
            const { checkout_url } = await res.json();
            window.location.href = checkout_url;
          }
        }}
      />

      <main className="studio-content-wrapper">
        {/* Mobile Navigation Header */}
        <header className="mobile-studio-nav">
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          <Link href="/" className="nav-brand" style={{ fontSize: "1.2rem", textAlign: "center", whiteSpace: "nowrap" }}>
            Fashiq <span className="brand-italic">AI</span>
          </Link>
          <div style={{ flex: 1 }} />
        </header>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div style={{
            position: "fixed",
            top: "2rem",
            right: "2rem",
            zIndex: 9999,
            background: "rgba(18, 18, 20, 0.95)",
            border: "1px solid var(--accent)",
            color: "#ffffff",
            padding: "0.85rem 1.4rem",
            borderRadius: "1rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            backdropFilter: "blur(12px)",
          }}>
            <span style={{ color: "var(--accent)" }}>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hidden File Input for photo upload — id used by label in modal for direct trigger */}
        <input
          id="model-photo-input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* ===== Upload Naming Modal ===== */}
        {showUploadModal && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) { setShowUploadModal(false); setPendingUploadName(""); } }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <div
              style={{
                background: "#18181b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "1.25rem",
                padding: "1.75rem 1.5rem 1.4rem",
                width: "100%",
                maxWidth: "340px",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Modal Title */}
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: "#fff", letterSpacing: "-0.01em" }}>
                  Name your model
                </h3>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>
                  Give this model a name before uploading her photo.
                </p>
              </div>

              {/* Name Input — starts blank, no pre-filled name */}
              <input
                autoFocus
                type="text"
                placeholder="e.g. Priya, Sarah, Aiden..."
                value={pendingUploadName}
                onChange={(e) => setPendingUploadName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (fileInputRef.current) fileInputRef.current.click();
                  }
                  if (e.key === "Escape") {
                    setShowUploadModal(false);
                    setPendingUploadName("");
                  }
                }}
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  borderRadius: "0.75rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
              />

              {/* Action Buttons Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                {/* Cancel — bottom left */}
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setPendingUploadName(""); }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--muted)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    padding: "0.4rem 0",
                    transition: "color 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
                >
                  Cancel
                </button>

                {/* Upload Photo — pure HTML label linking natively to model-photo-input (zero JS interceptors!) */}
                <label
                  htmlFor="model-photo-input"
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, #a3e635 100%)",
                    border: "none",
                    color: "#0a0a0c",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    padding: "0.55rem 1.4rem",
                    borderRadius: "100px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    boxShadow: "0 4px 16px rgba(190,242,100,0.25)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    userSelect: "none",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(190,242,100,0.35)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(190,242,100,0.25)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Upload Photo
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: MAIN GALLERY & UPLOAD VIEW (Matching User Paper Sketch)            */}
        {/* ========================================================================= */}
        {viewMode === "gallery" && (
          <div className="animate-up" style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
            {/* Page Heading */}
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2.5rem",
                fontWeight: "400",
                letterSpacing: "-0.02em",
                marginBottom: "0.5rem",
              }}>
                Model Personas
              </h1>
              <p style={{ color: "var(--muted)", fontSize: "0.95rem", fontWeight: "300" }}>
                Upload or generate consistent model faces for your boutique photoshoots
              </p>
            </div>

            {/* Top Section: Saved Personas Display (Ref: Paper Sketch Top Row) */}
            <section style={{ marginBottom: "4rem" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
                padding: "0 0.5rem",
              }}>
                <h2 style={{
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--muted)",
                  fontWeight: "600",
                }}>
                  Saved Personas ({personas.length})
                </h2>
                {personas.length > 0 && (
                  <span style={{ fontSize: "0.8rem", color: "var(--accent)", opacity: 0.9 }}>
                    ● Ready for photoshoots
                  </span>
                )}
              </div>

              {/* Personas Cards Row / Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1.5rem",
                justifyContent: "center",
              }}>
                {/* Render Saved Personas */}
                {personas.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => setPreviewPersona(persona)}
                    style={{
                      position: "relative",
                      background: "var(--surface)",
                      borderRadius: "1.25rem",
                      border: "1px solid var(--border)",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                      aspectRatio: "3/4",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.boxShadow = "0 12px 30px rgba(190, 242, 100, 0.15)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.2)";
                    }}
                  >
                    <img
                      src={persona.imageUrl}
                      alt={persona.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    {/* Gradient Overlay for card details */}
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "0.85rem",
                    }}>
                      {/* Badge & Delete button */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{
                          background: persona.source === "AI Generated" ? "rgba(190, 242, 100, 0.2)" : "rgba(0, 0, 0, 0.6)",
                          backdropFilter: "blur(6px)",
                          color: persona.source === "AI Generated" ? "var(--accent)" : "var(--foreground)",
                          fontSize: "0.65rem",
                          fontWeight: "600",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "1rem",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}>
                          {persona.source === "AI Generated" ? "✨ AI Model" : "📷 Uploaded"}
                        </span>

                        <button
                          onClick={(e) => handleDeletePersona(persona.id, e)}
                          title="Delete Persona"
                          style={{
                            background: "rgba(255, 77, 79, 0.2)",
                            border: "1px solid rgba(255, 77, 79, 0.4)",
                            color: "#ff4d4f",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 77, 79, 0.5)")}
                          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 77, 79, 0.2)")}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>

                      {/* Name & Subtitle */}
                      <div>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#fff", margin: 0 }}>
                          {persona.name}
                        </h3>
                        <p style={{ fontSize: "0.7rem", color: "var(--muted)", margin: "0.15rem 0 0" }}>
                          Click to preview
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Show Placeholder Frames (Matches the 3 squircle model slots in the sketch) */}
                {Array.from({ length: Math.max(0, 3 - personas.length) }).map((_, idx) => (
                  <div
                    key={`placeholder_${idx}`}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      borderRadius: "1.25rem",
                      border: "2px dashed rgba(255, 255, 255, 0.12)",
                      background: "rgba(255, 255, 255, 0.02)",
                      aspectRatio: "3/4",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "1.5rem",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "border-color 0.2s, background 0.2s, transform 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.background = "rgba(190, 242, 100, 0.04)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "0.75rem",
                      color: "var(--muted)",
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: "500", color: "var(--foreground)", opacity: 0.8 }}>
                      + New Persona
                    </span>
                    <span style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                      Slot {personas.length + idx + 1} Available
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Center Action Buttons (Ref: Paper Sketch - Two vertical buttons centered) */}
            <section style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.25rem",
              maxWidth: "480px",
              margin: "0 auto",
            }}>
              {/* Button 1: Upload a Model Photo — opens naming modal first */}
              <button
                onClick={() => {
                  setPendingUploadName("");
                  setShowUploadModal(true);
                }}
                disabled={isUploading}
                style={{
                  width: "100%",
                  padding: "1.15rem 2rem",
                  borderRadius: "100px",
                  background: "linear-gradient(135deg, var(--accent) 0%, #a3e635 100%)",
                  color: "#0a0a0c",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: isUploading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  boxShadow: "0 8px 25px rgba(190, 242, 100, 0.25)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  opacity: isUploading ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (!isUploading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(190, 242, 100, 0.35)";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(190, 242, 100, 0.25)";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                {isUploading ? "Processing Photo..." : "Upload a Model Photo"}
              </button>

              {/* Button 2: Generate Model using AI (Transitions to AI Studio) */}
              <button
                onClick={() => setViewMode("create_ai")}
                style={{
                  width: "100%",
                  padding: "1.15rem 2rem",
                  borderRadius: "100px",
                  background: "rgba(255, 255, 255, 0.04)",
                  color: "var(--foreground)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  transition: "transform 0.2s ease, background 0.2s ease, border-color 0.2s ease",
                  backdropFilter: "blur(10px)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
                Generate Model using AI
              </button>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DEDICATED AI MODEL PERSONA CREATOR WORKSPACE                      */}
        {/* ========================================================================= */}
        {viewMode === "create_ai" && (
          <div className="animate-up" style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1.5rem 5rem" }}>
            
            {/* Top Navigation Bar: Back button */}
            <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={() => setViewMode("gallery")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "100px",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              >
                ← Back to Personas
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--accent)" }}>
                <span>✨ Studio Persona Engine</span>
              </div>
            </div>

            {/* Header */}
            <div style={{ marginBottom: "2.5rem" }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2.2rem",
                fontWeight: "400",
                marginBottom: "0.35rem",
              }}>
                AI Model Persona Creator
              </h1>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: "300" }}>
                Configure facial aesthetics and generate consistent model personas for your brand photoshoots.
              </p>
            </div>

            {/* Two-Column Studio Layout */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: "2.5rem",
              alignItems: "start",
            }}>
              
              {/* LEFT COLUMN: ATTRIBUTES & PROMPT BUILDER */}
              <div style={{
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "1.5rem",
                border: "1px solid var(--border)",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.75rem",
              }}>
                
                {/* 1. Persona Name */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.6rem", fontWeight: "600" }}>
                    Persona Name
                  </label>
                  <input
                    type="text"
                    value={aiForm.name}
                    onChange={(e) => setAiForm({ ...aiForm, name: e.target.value })}
                    placeholder="e.g. Maya - Minimalist Editorial"
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      borderRadius: "0.75rem",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid var(--border)",
                      color: "#fff",
                      fontSize: "0.95rem",
                      outline: "none",
                    }}
                  />
                </div>

                {/* 2. Gender */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.6rem", fontWeight: "600" }}>
                    Gender
                  </label>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {["Female", "Male", "Unisex"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setAiForm({ ...aiForm, gender: g })}
                        style={{
                          flex: 1,
                          padding: "0.65rem 1rem",
                          borderRadius: "100px",
                          border: aiForm.gender === g ? "1px solid var(--accent)" : "1px solid var(--border)",
                          background: aiForm.gender === g ? "rgba(190, 242, 100, 0.12)" : "rgba(255,255,255,0.03)",
                          color: aiForm.gender === g ? "var(--accent)" : "var(--muted)",
                          fontSize: "0.85rem",
                          fontWeight: aiForm.gender === g ? "600" : "400",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Ethnicity / Heritage */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.6rem", fontWeight: "600" }}>
                    Ethnicity / Heritage
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {ETHNICITIES.map((eth) => (
                      <button
                        key={eth}
                        onClick={() => setAiForm({ ...aiForm, ethnicity: eth })}
                        style={{
                          padding: "0.5rem 0.9rem",
                          borderRadius: "100px",
                          border: aiForm.ethnicity === eth ? "1px solid var(--accent)" : "1px solid var(--border)",
                          background: aiForm.ethnicity === eth ? "rgba(190, 242, 100, 0.12)" : "rgba(255,255,255,0.02)",
                          color: aiForm.ethnicity === eth ? "var(--accent)" : "var(--muted)",
                          fontSize: "0.8rem",
                          fontWeight: aiForm.ethnicity === eth ? "600" : "400",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {eth}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Age Range & Hair Style */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.6rem", fontWeight: "600" }}>
                      Age Range
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {AGE_RANGES.map((age) => (
                        <button
                          key={age}
                          onClick={() => setAiForm({ ...aiForm, age })}
                          style={{
                            flex: 1,
                            padding: "0.45rem 0.6rem",
                            borderRadius: "0.5rem",
                            border: aiForm.age === age ? "1px solid var(--accent)" : "1px solid var(--border)",
                            background: aiForm.age === age ? "rgba(190, 242, 100, 0.12)" : "rgba(255,255,255,0.02)",
                            color: aiForm.age === age ? "var(--accent)" : "var(--muted)",
                            fontSize: "0.75rem",
                            fontWeight: aiForm.age === age ? "600" : "400",
                            cursor: "pointer",
                          }}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.6rem", fontWeight: "600" }}>
                      Hair Color
                    </label>
                    <select
                      value={aiForm.hairColor}
                      onChange={(e) => setAiForm({ ...aiForm, hairColor: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "0.5rem",
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    >
                      {HAIR_COLORS.map((hc) => (
                        <option key={hc} value={hc} style={{ background: "#121214", color: "#fff" }}>
                          {hc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. Hairstyle & Eye Color */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.6rem", fontWeight: "600" }}>
                      Hairstyle
                    </label>
                    <select
                      value={aiForm.hairStyle}
                      onChange={(e) => setAiForm({ ...aiForm, hairStyle: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "0.5rem",
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    >
                      {HAIRSTYLES.map((hs) => (
                        <option key={hs} value={hs} style={{ background: "#121214", color: "#fff" }}>
                          {hs}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.6rem", fontWeight: "600" }}>
                      Eye Color
                    </label>
                    <select
                      value={aiForm.eyeColor}
                      onChange={(e) => setAiForm({ ...aiForm, eyeColor: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "0.5rem",
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    >
                      {EYE_COLORS.map((ec) => (
                        <option key={ec} value={ec} style={{ background: "#121214", color: "#fff" }}>
                          {ec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 6. Vibe / Editorial Aesthetic */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.6rem", fontWeight: "600" }}>
                    Photography Aesthetic
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {VIBES.map((v) => (
                      <button
                        key={v}
                        onClick={() => setAiForm({ ...aiForm, vibe: v })}
                        style={{
                          padding: "0.5rem 0.9rem",
                          borderRadius: "100px",
                          border: aiForm.vibe === v ? "1px solid var(--accent)" : "1px solid var(--border)",
                          background: aiForm.vibe === v ? "rgba(190, 242, 100, 0.12)" : "rgba(255,255,255,0.02)",
                          color: aiForm.vibe === v ? "var(--accent)" : "var(--muted)",
                          fontSize: "0.8rem",
                          fontWeight: aiForm.vibe === v ? "600" : "400",
                          cursor: "pointer",
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Expression */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.6rem", fontWeight: "600" }}>
                    Facial Expression
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {EXPRESSIONS.map((exp) => (
                      <button
                        key={exp}
                        onClick={() => setAiForm({ ...aiForm, expression: exp })}
                        style={{
                          padding: "0.5rem 0.9rem",
                          borderRadius: "100px",
                          border: aiForm.expression === exp ? "1px solid var(--accent)" : "1px solid var(--border)",
                          background: aiForm.expression === exp ? "rgba(190, 242, 100, 0.12)" : "rgba(255,255,255,0.02)",
                          color: aiForm.expression === exp ? "var(--accent)" : "var(--muted)",
                          fontSize: "0.8rem",
                          fontWeight: aiForm.expression === exp ? "600" : "400",
                          cursor: "pointer",
                        }}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 8. Optional Custom Prompt Details */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.6rem", fontWeight: "600" }}>
                    Custom Features / Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={aiForm.customPrompt}
                    onChange={(e) => setAiForm({ ...aiForm, customPrompt: e.target.value })}
                    placeholder="e.g. Subtle freckles on nose, natural minimal makeup, sculpted cheekbones..."
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.75rem",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid var(--border)",
                      color: "#fff",
                      fontSize: "0.85rem",
                      resize: "none",
                      outline: "none",
                      lineHeight: 1.4,
                    }}
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi}
                  style={{
                    width: "100%",
                    padding: "1.1rem",
                    borderRadius: "100px",
                    background: "linear-gradient(135deg, var(--accent) 0%, #a3e635 100%)",
                    color: "#0a0a0c",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: isGeneratingAi ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    boxShadow: "0 8px 25px rgba(190, 242, 100, 0.25)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    opacity: isGeneratingAi ? 0.75 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!isGeneratingAi) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 12px 30px rgba(190, 242, 100, 0.35)";
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(190, 242, 100, 0.25)";
                  }}
                >
                  {isGeneratingAi ? (
                    <>
                      <div className="spinner" style={{ width: "18px", height: "18px", border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Synthesizing Model Face... ({generationTimer}s)
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      Generate Model Variations
                    </>
                  )}
                </button>
              </div>

              {/* RIGHT COLUMN: CANDIDATE RESULTS & SAVE SELECTION */}
              <div style={{
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "1.5rem",
                border: "1px solid var(--border)",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                minHeight: "550px",
              }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                    Generated Model Previews
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                    {aiCandidates.length > 0
                      ? "Click on your favorite face variation to select and save it."
                      : "Generated face variations will appear here."}
                  </p>
                </div>

                {/* Live Output Container */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  
                  {/* State A: Generating Loading Shimmer */}
                  {isGeneratingAi && (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1.25rem",
                      padding: "1rem 0",
                    }}>
                      {[1, 2].map((n) => (
                        <div
                          key={`loading_${n}`}
                          style={{
                            aspectRatio: "3/4",
                            borderRadius: "1.25rem",
                            background: "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.75rem",
                            animation: "pulse 1.5s infinite",
                          }}
                        >
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(190, 242, 100, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            ✨
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                            Rendering #{n}...
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* State B: Empty / Idle State */}
                  {!isGeneratingAi && aiCandidates.length === 0 && (
                    <div style={{
                      textAlign: "center",
                      padding: "3rem 1.5rem",
                      background: "rgba(0, 0, 0, 0.2)",
                      borderRadius: "1.25rem",
                      border: "1px dashed rgba(255,255,255,0.1)",
                    }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                        🎨
                      </div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                        Ready to Synthesize
                      </h4>
                      <p style={{ color: "var(--muted)", fontSize: "0.8rem", maxWidth: "280px", margin: "0 auto", lineHeight: 1.4 }}>
                        Customize your model attributes on the left and click &ldquo;Generate Model Variations&rdquo;.
                      </p>
                    </div>
                  )}

                  {/* State C: Candidates Display Grid */}
                  {!isGeneratingAi && aiCandidates.length > 0 && (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "1.25rem",
                      marginBottom: "1.5rem",
                    }}>
                      {aiCandidates.map((cand, idx) => {
                        const isSelected = selectedCandidateId === cand.id;
                        return (
                          <div
                            key={cand.id}
                            onClick={() => setSelectedCandidateId(cand.id)}
                            style={{
                              position: "relative",
                              borderRadius: "1.25rem",
                              aspectRatio: "3/4",
                              overflow: "hidden",
                              cursor: "pointer",
                              border: isSelected ? "2.5px solid var(--accent)" : "1px solid var(--border)",
                              boxShadow: isSelected ? "0 0 20px rgba(190, 242, 100, 0.3)" : "none",
                              transform: isSelected ? "scale(1.02)" : "scale(1)",
                              transition: "all 0.2s ease",
                              background: "rgba(255,255,255,0.02)",
                            }}
                          >
                            <img
                              src={cand.url}
                              alt={`Variation ${idx + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              onError={(e) => {
                                // If base64 failed or URL failed, try fallback with a fresh seed
                                const newSeed = Math.floor(Math.random() * 899999 + 100000);
                                const encoded = encodeURIComponent(aiForm.name || "fashion portrait");
                                e.currentTarget.src = `https://image.pollinations.ai/prompt/${encoded}?model=turbo&width=512&height=768&nologo=true&seed=${newSeed}`;
                              }}
                            />

                            {/* Selected Checkmark Badge */}
                            {isSelected && (
                              <div style={{
                                position: "absolute",
                                top: "0.75rem",
                                right: "0.75rem",
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                background: "var(--accent)",
                                color: "#000",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: "0.85rem",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                              }}>
                                ✓
                              </div>
                            )}

                            {/* Label */}
                            <div style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                              padding: "0.6rem 0.75rem",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              color: isSelected ? "var(--accent)" : "#fff",
                            }}>
                              Variation {idx + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Save Selected Persona Action */}
                {!isGeneratingAi && aiCandidates.length > 0 && (
                  <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button
                      onClick={handleSaveSelectedAiPersona}
                      disabled={!selectedCandidateId}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        borderRadius: "100px",
                        background: "var(--foreground)",
                        color: "#000",
                        border: "none",
                        fontSize: "0.95rem",
                        fontWeight: "700",
                        cursor: selectedCandidateId ? "pointer" : "not-allowed",
                        opacity: selectedCandidateId ? 1 : 0.5,
                        transition: "transform 0.2s",
                      }}
                      onMouseOver={(e) => {
                        if (selectedCandidateId) e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      ⭐ Save Selected Persona
                    </button>

                    <button
                      onClick={handleGenerateAi}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "100px",
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "var(--muted)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      🔄 Re-roll Variations
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Full Preview Modal for Saved Personas */}
      {previewPersona && (
        <div
          onClick={() => setPreviewPersona(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)",
              borderRadius: "1.5rem",
              border: "1px solid var(--border)",
              maxWidth: "480px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ position: "relative", aspectRatio: "3/4", width: "100%" }}>
              <img
                src={previewPersona.imageUrl}
                alt={previewPersona.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <button
                onClick={() => setPreviewPersona(null)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "rgba(0, 0, 0, 0.6)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                {previewPersona.name}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
                Added {new Date(previewPersona.createdAt).toLocaleDateString()} • {previewPersona.source}
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Link
                  href={`/studio/${businessType || "clothing"}`}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "0.75rem",
                    borderRadius: "100px",
                    background: "var(--accent)",
                    color: "#000",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    textDecoration: "none",
                  }}
                >
                  Use in Studio →
                </Link>
                <button
                  onClick={(e) => handleDeletePersona(previewPersona.id, e)}
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderRadius: "100px",
                    background: "transparent",
                    border: "1px solid rgba(255, 77, 79, 0.5)",
                    color: "#ff4d4f",
                    fontWeight: "500",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
