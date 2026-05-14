import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { garment_image, gender, identity, pose, background, style, jewelryType, business_type = "clothing", photoshootOption, productDescription, surface } = await req.json();

    if (!garment_image) {
      return NextResponse.json({ error: "No product image provided" }, { status: 400 });
    }

    const apiKey = process.env.FASHN_API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      return NextResponse.json({ error: "FASHN_API_KEY is not configured in .env.local" }, { status: 500 });
    }

    // --- Subscription / credit gate ---
    {
      const { createClient } = await import("@/utils/supabase/server");
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan, credits_remaining, subscription_status")
          .eq("id", user.id)
          .single();

        const plan = profile?.plan ?? "free";

        if (plan === "free") {
          // Free users get exactly 1 generation; block on the 2nd
          const { count } = await supabase
            .from("generations")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id);

          if ((count ?? 0) >= 1) {
            return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
          }
        } else {
          // Paid users: check credits
          if ((profile?.credits_remaining ?? 0) <= 0) {
            return NextResponse.json({ error: "no_credits" }, { status: 402 });
          }
          // Deduct credit atomically
          await supabase
            .from("profiles")
            .update({ credits_remaining: profile.credits_remaining - 1 })
            .eq("id", user.id);
        }
      }
    }

    // Multi-Pose Randomness Engine (Sub-pose variations for diversity)
    const poseVariations = {
      "Front": [
        "facing forward with a relaxed natural posture and subtle head tilt",
        "standing facing camera with weight shifted naturally to one side",
        "clean front-on editorial pose with hands naturally at sides",
        "facing the viewer with a gentle, candid forward-facing stance",
        "facing forward with a soft, engaging expression and relaxed shoulders"
      ],
      "Side View": [
        "elegant side profile captured naturally from a 45-degree angle",
        "captured in a candid 3/4 profile view looking slightly away",
        "side view with a natural editorial posture, torso slightly turned forward",
        "standing in a clean profile view with weight naturally distributed"
      ],
      "Back": [
        "viewed from behind, showcasing full back detail with natural fabric drapes",
        "standing with back to camera, head subtly turned to look over shoulder",
        "graceful back view in a relaxed, non-stiff fashion stance",
        "clean back profile focusing on garment silhouette and texture"
      ],
      "Walking": [
        "mid-stride in a candid street-style moment, walking naturally",
        "walking gracefully as if on a catwalk, subtle movement blur",
        "stepping forward with natural motion and an effortlessly chic gait",
        "caught in a confident forward movement, dynamic and alive"
      ],
      "Sitting": [
        "sitting elegantly on a minimalist chair, showcasing how the fabric drapes",
        "resting naturally in a seated pose, relaxed editorial posture",
        "sitting comfortably with a chic, candid lean toward the camera",
        "sophisticated seated position focusing on the garment's natural flow"
      ],
      "Leaning": [
        "leaning naturally against a texture-rich wall, relaxed shoulders",
        "leaning gracefully with a candid and approachable fashion vibe",
        "rested stance against a minimalist pillar, chic and natural posture",
        "relaxed leaning pose with subtle movement and natural micro-expressions"
      ],
      "Hands on Hips": [
        "powerful fashion silhouette with one hand naturally on a hip",
        "classic hands-on-hips xpose with relaxed fingers and a soft expression",
        "standing confidently with hands on hips, editorial weight distribution",
        "empowered fashion stance with subtle, natural body angles"
      ],
      "Close up (Full)": [
        "High-end close-up portrait, focusing on the model's upper body and face",
        "Editorial beauty shot, intimate framing, detailed skin textures",
        "Professional close-up photography, elegant head and shoulder framing",
        "Macro-style fashion portrait, soft depth of field, focused on accessories"
      ],
      "Close up (Half Face)": [
        "Close-up focus on the garment and accessory, model's face partially framed",
        "Intimate detail shot, cinematic cropping, focus on material and texture",
        "Artistic fashion crop, emphasizing the product with natural human interaction",
        "Detailed macro view of the fashion piece on model, soft focus on features"
      ]
    };

    // Selection Logic: Use random variation if available, else use raw pose
    let targetPose = pose || "standing elegantly";
    if (poseVariations[pose]) {
      const options = poseVariations[pose];
      targetPose = options[Math.floor(Math.random() * options.length)];
    }

    // Dynamic Prompt Engineering for Realism and "Soul"
    const photographyVibe = [
      "shot on 35mm film, realistic skin textures, high-end editorial style",
      "natural window lighting, soft shadows, sharp focus on fabric weave",
      "cinematic lighting, professional boutique photography, 8k resolution, raw photo",
      "dramatic soft lighting, high-fashion aesthetic, intricate detail, photorealistic"
    ];
    const randomVibe = photographyVibe[Math.floor(Math.random() * photographyVibe.length)];

    // Category Specific Tuning
    let categoryKeywords = "";
    let generationMode = "fast";
    let compositionStyle = targetPose; // Default to the selected pose variation

    if (business_type === "jewelry") {
      generationMode = "quality"; // Mandatory for jewelry details
      categoryKeywords = "luxury jewelry, gold and gemstone reflections, fine metal craftsmanship, sparkling ornaments, exquisite detail, high-end accessory brand";

      // Jewelry-Specific Style Mapping (Hero-First Composition)
      const jewelryStyleMap = {
        "Auto": "a high-end luxury jewelry catalog photoshoot, showcasing the ornament's brilliance and craftsmanship on a model",
        "Editorial High-Fashion": "a high-end high-fashion editorial photoshoot, full face portrait with elegant upper torso framing, showcasing the jewelry piece as a statement accessory, professional studio lighting",
        "Cinematic Half-Cut": "a cinematic close-up with an artistic half-face crop, extreme focus on the jewelry's intricate details, dramatic lighting with soft shadows, high-fashion aesthetic",
        "Luminous Detail": "an extreme macro shot focusing entirely on the craftsmanship and stones of the necklace, highlighting luminous gemstone brilliance and fine metal textures, glowing reflections, soft-focus skin background",
        "Editorial Earring": "a high-end beauty portrait focusing on a model wearing luxury earrings, full face framed elegantly, high-fashion lighting, sharp focus on jewelry sparkle",
        "Macro Ear": "an extreme macro close-up of the ear and earring, capturing every detail of the stones and metalwork, soft depth of field, cinematic lighting",
        "Classic Editorial Ring": "a high-end jewelry editorial photoshoot, a model's hand resting gracefully near her chin, soft-focus face in background, professional studio lighting, sharp focus on the gemstone ring",
        "Cinematic Glow Ring": "a cinematic beauty shot, hand placed near lips, dramatic lighting highlighting the ring's sparkle and metallic reflections, warm fashion aesthetic",
        "Minimalist Product Ring": "a clean, minimalist jewelry catalog shot, hand resting on a soft white fabric surface, neutral lighting, absolute focus on the ring's design and clarity",
        "Graceful Portrait Ring": "a sophisticated fashion portrait, model's fingers near her cheek, showing a luxury ring on the finger, elegant lighting, shallow depth of field",
        "Soft Macro Ring": "a soft-focus macro shot of a model's hand, focused entirely on a delicate ring, smooth skin textures, natural lighting, high-end catalog feel",
        "Artistic Stance Ring": "an artistic jewelry pose, hand held in a dynamic, graceful position, showcasing the ring against a clean minimalist background, sharp focus, 8k resolution"
      };

      const selectedStyle = style || "Auto";
      compositionStyle = jewelryStyleMap[selectedStyle] || jewelryStyleMap["Auto"];

      // Contextualize by Jewelry Type if not Auto
    }

    if (business_type === "jewelry" && jewelryType && jewelryType !== "Auto") {
      categoryKeywords = `${jewelryType.toLowerCase()} ${categoryKeywords}`;
    } else if (business_type === "clothing") {
      categoryKeywords = "high-end fashion garment, realistic fabric drape, tailored clothing, boutique couture";
    }

    const year = new Date().getFullYear();

    // Construct the Final Prompt
    let finalPrompt = "";
    if (business_type === "jewelry") {
      finalPrompt = `A high-end ${year} luxury jewelry catalog photoshoot, ${compositionStyle}, wearing ${categoryKeywords}, shot on a ${gender} model. ${randomVibe}, sharp focus on product, high-end gemstone brilliance, realistic skin textures, 8k resolution, masterpiece.`;
    } else {
      finalPrompt = `A luxury ${year} fashion photoshoot, a ${gender} model with ${identity} features, ${compositionStyle}, in a professional ${background} setting. ${randomVibe}, natural skin pores, realistic micro-expressions, avoid plastic look, hyper-realistic, masterpiece.`;
    }

    const response = await fetch("https://api.fashn.ai/v1/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model_name: "product-to-model",
        inputs: {
          product_image: garment_image,
          prompt: finalPrompt,
          output_format: "png",
          generation_mode: generationMode,
          return_base64: false
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "FASHN.ai API Error" }, { status: response.status });
    }

    // --- Persist to Supabase ---
    try {
      const { createClient } = await import("@/utils/supabase/server");
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("generations").insert({
          user_id: user.id,
          prediction_id: data.id,
          status: "processing",
          input_image_url: garment_image.length > 2000 ? "base64_hidden" : garment_image, // Base64 might be too long for text column if not careful, better to store reference or skip for now
          config: { gender, identity, pose, background, style, jewelryType, business_type, photoshootOption, productDescription, surface },
        });
      }
    } catch (dbError) {
      console.error("Database save error (non-blocking):", dbError);
    }

    // Return the Prediction ID to the frontend for polling
    return NextResponse.json({ id: data.id });

  } catch (error) {
    console.error("Generate Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
