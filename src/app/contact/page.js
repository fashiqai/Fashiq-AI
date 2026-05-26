import React from 'react';

export const metadata = {
  title: 'Contact & Help | Fashiq AI',
};

export default function ContactPage() {
  return (
    <div style={{
      backgroundColor: '#0a0a0c',
      color: '#ffffff',
      minHeight: '100vh',
      paddingTop: '100px',
      paddingBottom: '100px',
      paddingLeft: '20px',
      paddingRight: '20px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <p style={{ letterSpacing: '0.2em', opacity: 0.4, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          SUPPORT
        </p>
        <h1 style={{ fontSize: '2.75rem', marginBottom: '1.5rem', fontWeight: '600', fontFamily: "'Playfair Display', serif" }}>
          We&apos;re here to help
        </h1>
        <p style={{ color: '#a1a1a1', lineHeight: '1.8', marginBottom: '4rem', fontSize: '1.05rem' }}>
          Whether you have a question about your subscription, need a hand setting up your studio,
          or just want to share feedback — our team reads every message. Reach out and we&apos;ll get
          back to you within one business day.
        </p>

        <div style={{
          padding: '2.5rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1.5rem',
          marginBottom: '3rem',
        }}>
          <p style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.75rem' }}>
            Email us directly
          </p>
          <a
            href="mailto:fashiq.ai@gmail.com"
            style={{
              fontSize: '1.75rem',
              fontWeight: '600',
              color: '#ffffff',
              textDecoration: 'none',
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
            }}
          >
            fashiq.ai@gmail.com
          </a>
          <p style={{ color: '#a1a1a1', fontSize: '0.9rem', marginTop: '1.25rem', lineHeight: '1.7' }}>
            Send us your question along with your account email, and any screenshots if relevant.
            The more context, the faster we can help.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
              Billing & subscriptions
            </h3>
            <p style={{ color: '#a1a1a1', lineHeight: '1.7' }}>
              Questions about credits, plan upgrades, refunds, or invoices — we&apos;ll sort it out quickly.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
              Technical support
            </h3>
            <p style={{ color: '#a1a1a1', lineHeight: '1.7' }}>
              Login trouble, missing generations, or studio issues. Include your account email so we
              can look into your specific case.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
              Feedback & feature requests
            </h3>
            <p style={{ color: '#a1a1a1', lineHeight: '1.7' }}>
              Tell us what would make Fashiq AI work better for your boutique. We build with our
              customers, not for them.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
