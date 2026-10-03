import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const {
      gender = "Female",
      ethnicity = "Western",
      age = "Mid 20s",
      hairStyle = "Soft Waves",
      hairColor = "Dark Brown",
      eyeColor = "Brown",
      vibe = "High-Fashion Editorial",
      expression = "Confident Neutral",
      customPrompt = "",
      count = 2,
    } = await req.json();

    // Map attributes into photorealistic prompt keywords
    const ethnicityKeywords = {
      "Western": "caucasian western features",
      "East Asian": "east asian features, radiant luminous skin",
      "South Asian": "south asian features, warm golden undertones",
      "Black / Afro": "black model with radiant deep skin tone",
      "Latina / Hispanic": "latina hispanic features, sun-kissed natural glow",
      "Middle Eastern": "middle eastern features, elegant sculpted facial structure",
      "Scandinavian": "scandinavian features, nordic aesthetic, porcelain skin",
    };

    const vibeKeywords = {
      "High-Fashion Editorial": "vogue editorial style, soft studio softbox lighting, 85mm portrait lens",
      "Natural Commercial": "fresh modern boutique catalog look, soft daylight studio illumination",
      "Luxury Glamour": "luxury fashion magazine cover, dewy glowing skin, pristine headshot portraiture",
      "Streetwear / Edge": "contemporary chic fashion portrait, cinematic ambient studio lighting",
    };

    const expressionKeywords = {
      "Confident Neutral": "confident calm gaze directly at camera, poised posture",
      "Subtle Warm Smile": "subtle warm approachable smile, engaging gentle expression",
      "Editorial Gaze": "alluring high-fashion gaze, slightly parted lips, relaxed facial micro-expressions",
      "Poised & Serene": "serene elegant expression, soft eyes, balanced facial symmetry",
    };

    const selectedEthnicity = ethnicityKeywords[ethnicity] || ethnicity;
    const selectedVibe = vibeKeywords[vibe] || vibe;
    const selectedExpression = expressionKeywords[expression] || expression;

    const basePrompt = `Close-up studio headshot portrait photo of a ${age} ${gender.toLowerCase()} model with ${selectedEthnicity}, styled ${hairColor.toLowerCase()} ${hairStyle.toLowerCase()} hair, ${eyeColor.toLowerCase()} eyes, ${selectedExpression}. ${customPrompt ? customPrompt.trim() + ", " : ""}${selectedVibe}, clean neutral solid studio backdrop, ultra-realistic skin pores and natural micro-textures, photorealistic masterpiece, 8k resolution`;

    const numVariations = Math.min(Math.max(1, count), 4);
    const images = [];

    // Helper to fetch and verify an image variation
    async function fetchSingleImage(index, seed) {
      const encodedPrompt = encodeURIComponent(basePrompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=turbo&width=512&height=768&nologo=true&seed=${seed}`;

      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          if (buffer && buffer.byteLength > 1000) {
            const base64 = Buffer.from(buffer).toString("base64");
            return {
              id: `var_${index}_${seed}`,
              url: `data:image/jpeg;base64,${base64}`,
              seed,
            };
          }
        }
      } catch (err) {
        console.warn(`Direct buffer fetch for seed ${seed} timed out, using CDN URL:`, err?.message);
      }

      return {
        id: `var_${index}_${seed}`,
        url,
        seed,
      };
    }

    // Generate variations sequentially with 1.5s delay to prevent rate-limit collisions
    for (let i = 0; i < numVariations; i++) {
      const seed = Math.floor(Math.random() * 899999 + 100000);
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      const item = await fetchSingleImage(i, seed);
      if (item) {
        images.push(item);
      }
    }

    return NextResponse.json({
      success: true,
      prompt: basePrompt,
      images,
    });

  } catch (error) {
    console.error("AI Persona Generation API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error during generation" },
      { status: 500 }
    );
  }
}
