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
      headers: { "Authorization": `Bearer ${apiKey}` }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "FASHN.ai API Error" }, { status: response.status });
    }

    if (data.status === "completed" && data.output && data.output.length > 0) {
      const fashnUrl = data.output[0];
      let finalUrl = fashnUrl; // declared outside try so it's always in scope

      try {
        const { createClient } = await import("@/utils/supabase/server");
        const supabase = await createClient();

        // If already mirrored to Supabase, return immediately
        const { data: existing } = await supabase
          .from("generations")
          .select("output_image_url")
          .eq("prediction_id", id)
          .single();

        if (existing?.output_image_url && existing.output_image_url.includes("supabase.co")) {
          return NextResponse.json({ status: "completed", output: [existing.output_image_url] });
        }

        // Save Fashn URL to DB immediately so status is marked completed
        await supabase
          .from("generations")
          .update({ status: "completed", output_image_url: fashnUrl })
          .eq("prediction_id", id);

        // Mirror image to Supabase Storage for permanent URL
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
            finalUrl = publicUrl; // permanent URL — update the in-scope variable
          }
        } catch (uploadErr) {
          console.error("Mirror upload failed:", uploadErr);
          // finalUrl stays as fashnUrl, which is fine for now
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
