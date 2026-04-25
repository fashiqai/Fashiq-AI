"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(null);
  const supabase = createClient();

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setIsSent(true);
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
  };

  return (
    <div className="login-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--background)'
    }}>
      <div className="login-card animate-up" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '3rem',
        background: 'var(--surface)',
        borderRadius: '2rem',
        boxShadow: 'var(--card-shadow)',
        textAlign: 'center',
        border: '1px solid var(--border)'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
        <p style={{ opacity: 0.5, marginBottom: '2.5rem' }}>Experience the future of fashion imaging.</p>

        {isSent ? (
          <div style={{ padding: '2rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <h3 style={{ marginBottom: '1rem' }}>Check your email</h3>
            <p style={{ opacity: 0.6 }}>We sent a magic login link to <b>{email}</b>. It should arrive in a few seconds.</p>
            <button 
              onClick={() => setIsSent(false)} 
              style={{ background: 'none', border: 'none', color: 'var(--foreground)', textDecoration: 'underline', marginTop: '2rem', cursor: 'pointer', opacity: 0.4 }}
            >
              Try another email
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleMagicLink} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.4, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid var(--border)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    background: 'var(--background)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>

              {error && <p style={{ color: '#ff4d4f', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="generate-btn" 
                style={{ width: '100%', padding: '1.25rem' }}
              >
                {isLoading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>

            <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', opacity: 0.2 }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ padding: '0 1rem', fontSize: '0.8rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <button 
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                padding: '1.25rem',
                borderRadius: '1rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background 0.2s',
                color: 'var(--foreground)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--background)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface)'}
            >
              <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google" />
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
