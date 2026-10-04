import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    // ── Attribute → photorealistic keyword maps ──────────────────────────────
    const ethnicityMap = {
      "Western":           "caucasian western woman with fair natural skin",
      "East Asian":        "east asian woman with smooth luminous skin and defined features",
      "South Asian":       "south asian woman with warm golden brown skin tone",
      "Black / Afro":      "black woman with rich deep skin tone and radiant complexion",
      "Latina / Hispanic": "latina woman with warm sun-kissed olive skin",
      "Middle Eastern":    "middle eastern woman with elegant sculpted features and olive complexion",
      "Scandinavian":      "scandinavian woman with nordic features, porcelain fair skin and light eyes",
    };

    const vibeMap = {
      "High-Fashion Editorial": "vogue editorial style portrait, professional softbox studio lighting, 85mm prime lens, fashion magazine quality",
      "Natural Commercial":     "clean commercial headshot, soft natural daylight, modern catalog style",
      "Luxury Glamour":         "luxury beauty campaign, dewy glowing skin, pristine high-end glamorous headshot",
      "Streetwear / Edge":      "contemporary fashion portrait, cinematic moody studio lighting, urban editorial",
    };

    const expressionMap = {
      "Confident Neutral":  "confident neutral expression, direct gaze into camera, poised and composed",
      "Subtle Warm Smile":  "subtle warm smile, soft approachable expression, gentle inviting eyes",
      "Editorial Gaze":     "alluring high-fashion gaze, slightly parted lips, intense editorial stare",
      "Poised & Serene":    "serene calm expression, soft dreamy eyes, balanced peaceful face",
    };

    const selectedEthnicity  = ethnicityMap[ethnicity]   || ethnicity;
    const selectedVibe        = vibeMap[vibe]             || vibe;
    const selectedExpression  = expressionMap[expression] || expression;

    // ── Build the photorealistic prompt ─────────────────────────────────────
    const prompt = [
      `Professional close-up headshot portrait photo of a ${age} ${gender.toLowerCase()} fashion model.`,
      `The model is a ${selectedEthnicity}.`,
      `Hair: ${hairColor} ${hairStyle}.`,
      `Eyes: ${eyeColor}.`,
      `Expression: ${selectedExpression}.`,
      customPrompt ? `Additional details: ${customPrompt.trim()}.` : "",
      `Style: ${selectedVibe}.`,
      `Background: clean solid neutral studio backdrop.`,
      `Technical: ultra-realistic skin pores and natural micro-textures, sharp focus on facial features, photorealistic, professional commercial photography quality.`,
    ].filter(Boolean).join(" ");

    // ── Call OpenAI gpt-image-1 — single image to keep costs low ──────────────
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1536",   // portrait aspect ratio
      quality: "medium",   // "low" ~$0.011, "medium" ~$0.042, "high" ~$0.167
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No images returned from OpenAI");
    }

    // gpt-image-1 returns base64 by default (b64_json)
    const images = response.data.map((img, i) => {
      const base64 = img.b64_json;
      const url = base64
        ? `data:image/png;base64,${base64}`
        : img.url; // fallback if URL returned

      return {
        id: `var_${i}_${Date.now()}`,
        url,
        seed: i,
      };
    });

    return NextResponse.json({
      success: true,
      prompt,
      images,
    });

  } catch (error) {
    console.error("AI Persona Generation API Error:", error);
    // Surface OpenAI-specific error details
    const message =
      error?.error?.message ||
      error?.message ||
      "Internal Server Error during generation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
