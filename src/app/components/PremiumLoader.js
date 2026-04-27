"use client";

import { useEffect, useState } from "react";

export default function PremiumLoader({ preview, status }) {
  const [loadingText, setLoadingText] = useState(status || "Initializing...");
  
  const progressSteps = [
    "Analyzing Fabric Textures...",
    "Calibrating Lighting...",
    "Mapping Model Silhouette...",
    "Rendering High-Res Details...",
    "Finalizing Visual Polish...",
    "Generating Studio Quality..."
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % progressSteps.length;
      setLoadingText(progressSteps[index]);
    }, 4500); // Change every 4.5s (fits 30s-40s generation time)

    return () => clearInterval(interval);
  }, []);

  // Use the status from props if it's explicitly "Completed" or "Failed"
  const currentText = (status && status.includes("COMPLETED")) ? status : loadingText;

  return (
    <div className="premium-loader-container">
      <div className="processing-particles" />
      
      <div className="scanning-wrapper">
        {preview ? (
          <img src={preview} alt="Processing" className="scan-image-preview" />
        ) : (
          <div className="scan-image-preview" style={{ background: '#111' }} />
        )}
        
        <div className="scan-overlay" />
        <div className="scan-line" />
        <div className="shimmer-sweep" />
      </div>

      <div className="status-box">
        <div className="status-dot" />
        <span className="status-text">{currentText}</span>
      </div>
    </div>
  );
}
