import { NextResponse } from "next/server";

// Extend Vercel function timeout (Hobby allows up to 60s)
export const maxDuration = 60;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing Prediction ID" }, { status: 400 });
    }

    const apiKey = process.env.FASHN_API_KEY;
    const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "FASHN.ai API Error" }, { status: response.status });
    }

    if (data.status === "completed" && data.output && data.output.length > 0) {
      const fashnUrl = data.output[0];
      let finalUrl = fashnUrl;

      try {
        const { createClient } = await import("@/utils/supabase/server");
        const supabase = await createClient();

        const { data: existing } = await supabase
          .from("generations")
          .select("output_image_url")
          .eq("prediction_id", id)
          .single();

        // Already mirrored — return immediately
        if (existing?.output_image_url && existing.output_image_url.includes("supabase.co")) {
          return NextResponse.json({ status: "completed", output: [existing.output_image_url] });
        }

        // Mark as completed with Fashn URL first (so DB reflects status even if upload fails)
        await supabase
          .from("generations")
          .update({ status: "completed", output_image_url: fashnUrl })
          .eq("prediction_id", id);

        // Mirror to Supabase Storage
        try {
          console.log(`[Mirror] Starting upload for ${id}`);
          const imgRes = await fetch(fashnUrl);

          if (!imgRes.ok) {
            throw new Error(`Fashn image fetch failed: ${imgRes.status}`);
          }

          const arrayBuffer = await imgRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const fileName = `${id}.png`;

          const { error: uploadError } = await supabase.storage
            .from("photoshoots")
            .upload(fileName, buffer, { contentType: "image/png", upsert: true });

          if (uploadError) {
            console.error(`[Mirror] Upload error for ${id}:`, uploadError.message);
            throw new Error(uploadError.message);
          }

          const { data: { publicUrl } } = supabase.storage.from("photoshoots").getPublicUrl(fileName);

          await supabase
            .from("generations")
            .update({ output_image_url: publicUrl })
            .eq("prediction_id", id);

          finalUrl = publicUrl;
          console.log(`[Mirror] Success for ${id}: ${publicUrl}`);
        } catch (uploadErr) {
          console.error(`[Mirror] Failed for ${id}:`, uploadErr.message);
        }

      } catch (err) {
        console.error("DB/Storage error:", err);
      }

      return NextResponse.json({ status: "completed", output: [finalUrl] });
    }

    return NextResponse.json({ status: data.status, output: data.output });

  } catch (error) {
    console.error("Status Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
