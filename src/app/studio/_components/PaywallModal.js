"use client";

import { useState } from "react";

const STARTER_FEATURES = [
  "150 Credits / month",
  "150 AI-generated images",
  "Full Access to AI Models",
  "Standard Pose Library",
  "HD Photoshoot Quality",
  "Commercial Usage License",
];

const PRO_FEATURES = [
  "500 Credits / month",
  "500 AI-generated images",
  "Priority Generation Speed",
  "Ultra-HD (4K) Downloads",
  "Custom Background Uploads",
  "VIP Dedicated Support",
];

export default function PaywallModal({ isOpen, onClose, onUpgrade, context = "free", creditsResetAt }) {
  const [loadingPlan, setLoadingPlan] = useState(null);

  if (!isOpen) return null;

  const handleUpgrade = async (plan) => {
    setLoadingPlan(plan);
    try {
      await onUpgrade(plan);
    } finally {
      setLoadingPlan(null);
    }
  };

  const isExhausted = context === "no_credits";
  const isUpgrade = context === "upgrade"; // starter → pro

  const resetDateStr = creditsResetAt
    ? new Date(creditsResetAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        overflowY: "auto",
      }}
    >
      <div style={{
        position: "relative",
        maxWidth: isExhausted && context !== "upgrade" ? "480px" : "860px",
        width: "100%",
        margin: "auto",
        animation: "fadeIn 0.25s ease",
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-2.5rem",
            right: 0,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: "1.5rem",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-block",
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--accent)",
            border: "1px solid var(--accent)",
            borderRadius: "100px",
            padding: "0.3rem 1rem",
            marginBottom: "1rem",
            opacity: 0.8,
          }}>
            {isExhausted ? "Credits Exhausted" : "Upgrade Required"}
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: "400",
            letterSpacing: "-0.02em",
            margin: "0 0 0.75rem",
          }}>
            {isExhausted
              ? isUpgrade
                ? "Upgrade to Pro"
                : "You've Used All Credits"
              : "Unlock Your Shots"}
          </h2>

          <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: "480px", margin: "0 auto" }}>
            {isExhausted && !isUpgrade
              ? resetDateStr
                ? `Your credits reset on ${resetDateStr}. Upgrade to Pro for more.`
                : "Subscribe to continue generating and downloading images."
              : "Subscribe to download and generate unlimited images each month."}
          </p>
        </div>

        {/* Pro-only card for Starter users out of credits */}
        {isUpgrade ? (
          <div style={{ maxWidth: "420px", margin: "0 auto" }}>
            <PlanCard
              name="Pro"
              price={99}
              features={PRO_FEATURES}
              featured
              loading={loadingPlan === "pro"}
              onUpgrade={() => handleUpgrade("pro")}
              badge="Most Popular"
            />
          </div>
        ) : (
          /* Both plans for free users */
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}>
            <PlanCard
              name="Starter"
              price={49}
              features={STARTER_FEATURES}
              loading={loadingPlan === "starter"}
              onUpgrade={() => handleUpgrade("starter")}
            />
            <PlanCard
              name="Pro"
              price={99}
              features={PRO_FEATURES}
              featured
              badge="Most Popular"
              loading={loadingPlan === "pro"}
              onUpgrade={() => handleUpgrade("pro")}
            />
          </div>
        )}

        {/* Footer link */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              fontSize: "0.85rem",
              cursor: "pointer",
              textDecoration: "underline",
              opacity: 0.6,
            }}
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ name, price, features, featured, badge, loading, onUpgrade }) {
  return (
    <div className={`pricing-card${featured ? " featured" : ""}`}>
      {badge && <div className="pricing-badge">{badge}</div>}
      <div className="plan-name">{name}</div>
      <div className="plan-price">
        ${price}<span>/mo</span>
      </div>
      <ul className="feature-list">
        {features.map((f, i) => (
          <li key={i} className={`feature-item${i === 0 ? " highlight" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <button
        className="pricing-btn"
        onClick={onUpgrade}
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <span style={{
              width: "14px", height: "14px", border: "2px solid currentColor",
              borderTopColor: "transparent", borderRadius: "50%",
              animation: "spin 0.7s linear infinite", display: "inline-block",
            }} />
            Processing...
          </span>
        ) : (
          `Upgrade to ${name}`
        )}
      </button>
    </div>
  );
}
