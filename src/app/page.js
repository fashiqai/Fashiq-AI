"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How does FashiqAI ensure the model's pose matches my garment?",
      a: "Our proprietary AI analyzes the fabric drape, texture, and product dimensions of your raw photo. It then intelligently maps these details onto our diverse pose library to ensure a realistic, high-fashion fit that maintains the integrity of your design."
    },
    {
      q: "Do I need professional studio equipment to take the initial photos?",
      a: "Not at all. You can even use high-quality smartphone photos taken in natural lighting. FashiqAI handles the professional lighting, background removal, and editorial-grade rendering automatically."
    },
    {
      q: "Can I use the generated images for commercial advertising?",
      a: "Yes. Every image generated under our Starter and Pro plans includes a full commercial usage license. You are free to use them for social media, global e-commerce stores, and high-res print media."
    },
    {
      q: "What exactly is a 'Credit' and how is it used?",
      a: "One credit equals one full generation process. Each generation provides you with high-quality variations, allowing you to select the absolute best shot for your collection."
    },
    {
      q: "Can I customize the backgrounds to match my brand's current aesthetic?",
      a: "Absolutely. While our Starter plan includes pre-curated luxury locations, our Pro plan gives you the power to upload custom backgrounds, ensuring your AI photoshoots are perfectly consistent with your brand."
    },
    {
      q: "How fast can I expect to receive my finished photos?",
      a: "Standard generations take approximately 30–45 seconds. Pro users receive priority access to our high-speed compute cluster, typically delivering complex renders in under 20 seconds."
    }
  ];

  return (
    <div className="landing-page" style={{ background: 'var(--background)' }}>
      <Navbar />
      {/* Hero Section */}
      <section className="hero-compact animate-up">
        <div className="hero-content">
          <h1 className="hero-title">
            Transform Your Boutique with <br className="desktop-br" />
            <span className="italic-serif">Professional AI Photoshoots</span>
          </h1>

          <p className="hero-subtitle">
            Generate high-end, on-model fashion photography in seconds.
            Cost-effective, instant, and stunningly realistic.
          </p>

          <div className="hero-cta-group">
            <Link href="/studio/clothing" className="pill-btn">
              Start Creating <span className="arrow">→</span>
            </Link>
          </div>

          <div className="hero-marquee-container">
            <div className="marquee-content">
              {/* First Set of Images */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div key={`hero-${num}`} className="marquee-item">
                  <img src={`/hero/hero${num}.png`} alt={`Showcase ${num}`} loading="lazy" />
                </div>
              ))}
              {/* Duplicate Set for Seamless Loop */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div key={`hero-loop-${num}`} className="marquee-item">
                  <img src={`/hero/hero${num}.png`} alt={`Showcase ${num}`} aria-hidden="true" loading="lazy" />
                </div>
              ))}
            </div>

            {/* Added Gradient Masks for smooth entry/exit */}
            <div className="marquee-mask-left"></div>
            <div className="marquee-mask-right"></div>
          </div>
        </div>
      </section>

      <section className="landing-section animate-up">
        <div className="split-layout">
          <div className="section-visuals">
            <div className="collage-grid">
              {/* Pair 1: Emerald (Mobile Row 1) */}
              <img src="/showcase/jewelry/IMG_20260411_150716.jpg" className="collage-item jew-raw-1" alt="Raw Emerald" />
              <img src="/showcase/jewelry/fasionai-jewelry-1775900404244.png" className="collage-item jew-ai-1" alt="AI Emerald" />
              
              {/* Pair 2: Blue Ring (Mobile Row 2) */}
              <img src="/showcase/jewelry/HAEI08g.webp" className="collage-item jew-raw-2" alt="Raw Blue Ring" />
              <img src="/showcase/jewelry/fasionai-jewelry-1775916066741.png" className="collage-item jew-ai-2" alt="AI Blue Ring" />
              
              {/* Pair 3: Floral Necklace (Mobile Row 3) */}
              <img src="/showcase/jewelry/gf.png" className="collage-item jew-raw-3" alt="Raw Floral" />
              <img src="/showcase/jewelry/product_to_model_0.png" className="collage-item jew-ai-3" alt="AI Floral" />
            </div>
          </div>

          <div className="section-content">
            <p className="subtitle">PHOTOREALISTIC AI</p>
            <h2>Jewellery photoshoots</h2>
            <p className="description">
              Skip the expensive logistics of traditional jewelry photography.
              Generate professional model shots for your rings, necklaces, and earrings in seconds,
              cutting costs while maintaining a premium brand aesthetic.
            </p>
            <div className="button-group">
              <Link href="/login" className="generate-btn studio-nav-btn" style={{ margin: 0, textDecoration: 'none' }}>
                Jewelry Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clothing Section (Mirrored) */}
      <section className="landing-section animate-up">
        <div className="split-layout reversed">
          <div className="section-visuals">
            <div className="collage-grid">
              {/* Pair 1: Blue Top (Mobile Row 1) */}
              <img src="/showcase/clothing/6skaz_512.avif" className="collage-item clo-raw-1" alt="Raw Blue Top" />
              <img src="/showcase/clothing/fasionai-photoshoot-1775856101182.png" className="collage-item clo-ai-1" alt="AI Blue Top" />
              
              {/* Pair 2: Teal Dress (Mobile Row 2) */}
              <img src="/showcase/clothing/Bold bridal elegance in the Pantone 2026 trend color_ _created with Midjourney ai_.jpg" className="collage-item clo-raw-2" alt="Raw Teal Dress" />
              <img src="/showcase/clothing/fasionai-photoshoot-1776971533473.png" className="collage-item clo-ai-2" alt="AI Teal Dress" />
              
              {/* Pair 3: Maroon Dress (Mobile Row 3) */}
              <img src="/showcase/clothing/IMG_20260407_225659.jpg" className="collage-item clo-raw-3" alt="Raw Maroon Dress" />
              <img src="/showcase/clothing/fasionai-leaning-1775582990504.png" className="collage-item clo-ai-3" alt="AI Maroon Dress" />
            </div>
          </div>

          <div className="section-content">
            <p className="subtitle">INSTANT E-COMMERCE</p>
            <h2>Clothing Photoshoots</h2>
            <p className="description">
              Stop waiting for expensive studio slots. Upload your garment photos
              and watch as our AI generates stunning on-model photography in a
              variety of poses and settings, ready for your shop in seconds.
            </p>
            <div className="button-group">
              <Link href="/login" className="generate-btn studio-nav-btn" style={{ margin: 0, textDecoration: 'none' }}>
                Clothing Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="comparison-container animate-up">
        <div className="comparison-header">
          <p className="subtitle" style={{ color: 'var(--accent)', letterSpacing: '0.25em', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase' }}>
            THE EVOLUTION
          </p>
          <h2>The Shift to Modern Photography</h2>
        </div>

        <div className="comparison-row">
          <div className="comp-box traditional">
            <h4>Traditional Method</h4>
            <span className="comp-title">14-Day Lead Times</span>
            <p>Weeks of logistical planning, model casting calls, studio bookings, and post-production lag before you see a single result.</p>
          </div>
          <div className="comp-box fashiq">
            <h4>Fashiq AI Studio</h4>
            <span className="comp-title">Instant Deliverables</span>
            <p>Go from a raw product sample to a world-class editorial campaign in under 30 seconds. Scale your imagery at the speed of trends.</p>
          </div>
        </div>

        <div className="comparison-row">
          <div className="comp-box traditional">
            <h4>Traditional Method</h4>
            <span className="comp-title">High Production Overhead</span>
            <p>Massive investment required for studio rentals, photography crews, equipment, and on-site logistics for every session.</p>
          </div>
          <div className="comp-box fashiq">
            <h4>Fashiq AI Studio</h4>
            <span className="comp-title">Zero Physical Constraints</span>
            <p>A completely digitized studio pipeline with no physical overhead. Reallocate your production budget into direct brand growth.</p>
          </div>
        </div>

        <div className="comparison-row">
          <div className="comp-box traditional">
            <h4>Traditional Method</h4>
            <span className="comp-title">Limited Talent Access</span>
            <p>You are limited by the physical availability of local models, makeup artists, and world-class shoot locations.</p>
          </div>
          <div className="comp-box fashiq">
            <h4>Fashiq AI Studio</h4>
            <span className="comp-title">Infinite Variety</span>
            <p>Instantly place your products on any model archetype in any global setting. Your vision is no longer limited by your production reach.</p>
          </div>
        </div>
      </section>

      {/* Glass Era Side-by-Side Section */}
      <section className="era-section animate-up">
        <div className="era-grid">
          {/* Left Card: Jewelry */}
          <div className="era-card">
            <img src="/showcase/main-jewelry.jpg" alt="Jewelry Feature" />
          </div>

          {/* Right Card: Clothing */}
          <div className="era-card">
            <img src="/showcase/main-clothing.jpg" alt="Clothing Feature" />
          </div>

          {/* Glass Centerpiece Overlay */}
          <div className="era-glass-card">
            <div className="era-tag">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              FashiqAI
            </div>

            <h3>The New Era <br /> of Fashion <br /> Photoshoots</h3>

            <p>
              Discover curated jewelry and high-fashion edits tailored to your unique taste. The future of luxury style, personalized for you.
            </p>

            <Link href="/studio/clothing" className="era-cta">
              Shop The Collection
            </Link>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing-section animate-up">
        <div className="comparison-header">
          <p className="subtitle" style={{ color: 'var(--accent)', letterSpacing: '0.25em', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase' }}>
            SIMPLE PRICING
          </p>
          <h2>Choose Your Growth Path</h2>
        </div>

        <div className="pricing-grid">
          {/* Starter Plan */}
          <div className="pricing-card">
            <h3 className="plan-name">Starter</h3>
            <div className="plan-price">$49<span>/mo</span></div>
            <ul className="feature-list">
              <li className="feature-item highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                150 Credits / month
              </li>
              <li className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Full Access to AI Models
              </li>
              <li className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Standard Pose Library
              </li>
              <li className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                HD Photoshoot Quality
              </li>
              <li className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Commercial Usage License
              </li>
            </ul>
            <Link href="/login" className="pricing-btn">Get Started</Link>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <h3 className="plan-name">Pro</h3>
            <div className="plan-price">$99<span>/mo</span></div>
            <ul className="feature-list">
              <li className="feature-item highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                500 Credits / month
              </li>
              <li className="feature-item highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Priority Generation Speed
              </li>
              <li className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Ultra-HD (4K) Downloads
              </li>
              <li className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Custom Background Uploads
              </li>
              <li className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                VIP Dedicated Support
              </li>
            </ul>
            <Link href="/login" className="pricing-btn">Upgrade to Pro</Link>
          </div>
        </div>
      </section>

      {/* FAQ Section - Native Implementation for Absolute Mobile Reliability */}
      <section className="faq-section" style={{ paddingBottom: '10rem' }}>
        <div className="faq-header">
          <p className="subtitle" style={{ color: 'var(--accent)', letterSpacing: '0.25em', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase' }}>
            QUESTIONS
          </p>
          <h2>Common Inquiries</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={index} className="faq-item">
              <summary className="faq-question">
                <span>{faq.q}</span>
                <svg 
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                  className="faq-icon"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </summary>
              <div className="faq-answer-content">
                <p>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
