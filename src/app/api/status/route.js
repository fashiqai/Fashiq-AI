import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing Prediction ID" }, { status: 400 });
    }

    const apiKey = process.env.FASHN_API_KEY;
    const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "FASHN.ai API Error" }, { status: response.status });
    }

    // --- Optimized Completion Logic ---
    if (data.status === "completed" && data.output && data.output.length > 0) {
      const fashnUrl = data.output[0];

      // 1. Immediately check if we already have a Supabase URL
      // (This makes subsequent checks after completion blazing fast)
      try {
        const { createClient } = await import("@/utils/supabase/server");
        const supabase = await createClient();

        const { data: existing } = await supabase
          .from("generations")
          .select("output_image_url")
          .eq("prediction_id", id)
          .single();

        // If we already mirrored it to Supabase, use that (it's permanent)
        if (existing?.output_image_url && existing.output_image_url.includes("supabase.co")) {
          return NextResponse.json({ status: "completed", output: [existing.output_image_url] });
        }

        // 2. If it's NOT mirrored yet, we return the Fashn.ai URL immediately so the UI is fast.
        // BUT, we also want to trigger the mirroring.
        // On Vercel, we have to be careful with background tasks.
        
        // We update the DB status to completed with the Fashn URL first (very fast)
        await supabase
          .from("generations")
          .update({ status: "completed", output_image_url: fashnUrl })
          .eq("prediction_id", id);

        // 3. Now we start the "Mirroring" to Supabase Storage.
        // We don't 'await' the heavy upload before returning to the user!
        // This solves the Vercel 10s timeout issue.
        
        const mirrorToSupabase = async () => {
          try {
            const imgRes = await fetch(fashnUrl);
            const arrayBuffer = await imgRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileName = `${id}.png`;

            const { error: uploadError } = await supabase.storage
              .from("photoshoots")
              .upload(fileName, buffer, { contentType: "image/png", upsert: true });

            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage.from("photoshoots").getPublicUrl(fileName);
              await supabase
                .from("generations")
                .update({ output_image_url: publicUrl })
                .eq("prediction_id", id);
            }
          } catch (e) {
            console.error("Background Mirroring Failed:", e);
          }
        };

        // Fire and forget (Vercel might kill this if it takes too long, but the user ALREADY has their image)
        mirrorToSupabase();

      } catch (err) {
        console.error("DB/Storage pass-through error:", err);
      }

      // Return the Fashn URL immediately
      return NextResponse.json({ status: "completed", output: [fashnUrl] });
    }

    // Returns: processing, failed, etc.
    return NextResponse.json({ status: data.status, output: data.output });

  } catch (error) {
    console.error("Status Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
