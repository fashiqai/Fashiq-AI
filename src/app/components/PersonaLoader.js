"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Composing facial features...",
  "Calibrating skin tones...",
  "Sculpting bone structure...",
  "Adding hair & eye details...",
  "Applying studio lighting...",
  "Finalizing portrait quality...",
];

export default function PersonaLoader() {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Rotate status messages every 4s
    const msgInterval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 4000);

    // Elapsed seconds counter
    const timeInterval = setInterval(() => {
      setElapsed((t) => t + 1);
    }, 1000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="premium-loader-container">
      {/* Floating particles */}
      <div className="processing-particles" />

      {/* Portrait-shaped scanning frame */}
      <div className="scanning-wrapper" style={{ aspectRatio: "3/4" }}>
        {/* Dark placeholder in place of a real preview image */}
        <div
          className="scan-image-preview"
          style={{
            background:
              "linear-gradient(160deg, #0f0f11 0%, #1a1a1e 50%, #0f0f11 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Silhouette icon */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            style={{ opacity: 0.18 }}
          >
            <circle cx="12" cy="7" r="4" fill="currentColor" />
            <path
              d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Animated scan overlay + line */}
        <div className="scan-overlay" />
        <div className="scan-line" />
        <div className="shimmer-sweep" />
      </div>

      {/* Status bar */}
      <div className="status-box">
        <div className="status-dot" />
        <span className="status-text">{STEPS[stepIndex]}</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.72rem",
            color: "var(--muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {elapsed}s
        </span>
      </div>
    </div>
  );
}
