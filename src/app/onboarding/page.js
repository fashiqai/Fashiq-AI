"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);

  const handleSelection = async (type) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save to profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          business_type: type,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      router.push(`/studio/${type}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save preference. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="selection-page animate-up">
      <header className="header" style={{ marginBottom: '4rem' }}>
        <p>WELCOME TO FASHION AI</p>
        <h1>What is your Business Type?</h1>
        <p style={{ opacity: 0.6, letterSpacing: 'normal', textTransform: 'none' }}>Select your niche to access tailor-made AI tools. We'll remember this for your next visit.</p>
      </header>

      <div className="choice-container">
        {/* Clothing Choice */}
        <div 
          className="choice-card" 
          style={{ cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
          onClick={() => !isSaving && handleSelection('clothing')}
        >
          <div className="choice-image">
            <img 
              src="/choice-clothing.png" 
              alt="Clothing and Fashion" 
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800"; }}
            />
          </div>
          <div className="choice-content">
            <h3>Clothing / Fashion</h3>
            <p>Generate on-model photoshoots for garments, dresses, and apparel.</p>
          </div>
        </div>

        {/* Jewelry Choice */}
        <div 
          className="choice-card" 
          style={{ cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
          onClick={() => !isSaving && handleSelection('jewelry')}
        >
          <div className="choice-image">
            <img 
              src="/choice-jewelry.png" 
              alt="Jewelry and Ornaments" 
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800"; }}
            />
          </div>
          <div className="choice-content">
            <h3>Jewellery & Ornaments</h3>
            <p>Create high-end lifestyle images for necklaces, rings, and fine accessories.</p>
          </div>
        </div>
      </div>

      {isSaving && (
        <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5 }}>
          Saving your profile...
        </div>
      )}
    </div>
  );
}
