"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();
  const supabase = createClient();
  const otpRef = useRef(null);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setError(error.message);
    } else {
      setStep("otp");
      setResendTimer(60);
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (code) => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });

    if (error) {
      setError("Invalid or expired code. Try again.");
      setIsLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_type")
      .eq("id", user.id)
      .single();

    router.refresh();
    router.push(profile?.business_type ? `/studio/${profile.business_type}` : "/onboarding");
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
    if (val.length === 6) handleVerifyOtp(val);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const inputStyle = {
    width: "100%",
    padding: "1rem 1.5rem",
    borderRadius: "1rem",
    border: "1px solid var(--border)",
    fontSize: "1rem",
    outline: "none",
    background: "var(--background)",
    color: "var(--foreground)",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--background)",
    }}>
      <div className="animate-up" style={{
        width: "100%",
        maxWidth: "400px",
        padding: "3rem",
        background: "var(--surface)",
        borderRadius: "2rem",
        boxShadow: "var(--card-shadow)",
        textAlign: "center",
        border: "1px solid var(--border)",
      }}>

        {step === "email" ? (
          <>
            <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Welcome</h2>
            <p style={{ opacity: 0.5, marginBottom: "2.5rem" }}>
              Enter your email — we&apos;ll send you a code.
            </p>

            <form onSubmit={handleSendOtp} style={{ textAlign: "left" }}>
              <label style={{
                fontSize: "0.8rem", fontWeight: "600", opacity: 0.4,
                textTransform: "uppercase", marginBottom: "0.5rem", display: "block",
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ ...inputStyle, marginBottom: "1.5rem" }}
              />

              {error && (
                <p style={{ color: "#ff4d4f", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="generate-btn"
                style={{ width: "100%", padding: "1.25rem" }}
              >
                {isLoading ? "Sending..." : "Send Code"}
              </button>
            </form>

            <div style={{ margin: "2rem 0", display: "flex", alignItems: "center", opacity: 0.2 }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              <span style={{ padding: "0 1rem", fontSize: "0.8rem" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>

            <button
              onClick={handleGoogleLogin}
              style={{
                width: "100%", padding: "1.25rem", borderRadius: "1rem",
                border: "1px solid var(--border)", background: "var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "0.75rem", cursor: "pointer", fontWeight: "500",
                color: "var(--foreground)", transition: "background 0.2s",
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "var(--background)"}
              onMouseOut={(e) => e.currentTarget.style.background = "var(--surface)"}
            >
              <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google" />
              Continue with Google
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Check your email</h2>
            <p style={{ opacity: 0.5, marginBottom: "0.25rem" }}>We sent a 6-digit code to</p>
            <p style={{ fontWeight: "600", marginBottom: "2rem" }}>{email}</p>

            <input
              ref={otpRef}
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              disabled={isLoading}
              style={{
                ...inputStyle,
                fontSize: "2.5rem",
                fontWeight: "700",
                letterSpacing: "0.75rem",
                textAlign: "center",
                paddingLeft: "1.75rem",
                marginBottom: "1rem",
                opacity: isLoading ? 0.5 : 1,
              }}
            />

            {error && (
              <p style={{ color: "#ff4d4f", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                {error}
              </p>
            )}

            {isLoading && (
              <p style={{ opacity: 0.4, fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                Verifying...
              </p>
            )}

            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginTop: "1.5rem",
            }}>
              <button
                onClick={() => { setStep("email"); setOtp(""); setError(null); }}
                style={{
                  background: "none", border: "none", color: "var(--foreground)",
                  opacity: 0.4, cursor: "pointer", fontSize: "0.85rem",
                }}
              >
                ← Change email
              </button>
              <button
                onClick={() => handleSendOtp()}
                disabled={resendTimer > 0 || isLoading}
                style={{
                  background: "none", border: "none", color: "var(--foreground)",
                  opacity: resendTimer > 0 ? 0.3 : 0.6,
                  cursor: resendTimer > 0 ? "default" : "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
