import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { prediction_id } = await req.json();

    if (!prediction_id) {
      return NextResponse.json({ error: "Missing prediction_id" }, { status: 400 });
    }

    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: gen } = await supabase
      .from("generations")
      .select("output_image_url, user_id")
      .eq("prediction_id", prediction_id)
      .single();

    if (!gen || gen.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Already permanent
    if (gen.output_image_url?.includes("supabase.co")) {
      return NextResponse.json({ status: "already_mirrored", url: gen.output_image_url });
    }

    // Try to fetch the original URL — if expired, can't recover
    const imgRes = await fetch(gen.output_image_url);
    if (!imgRes.ok) {
      return NextResponse.json({ status: "expired" }, { status: 410 });
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const fileName = `${prediction_id}.png`;

    const { error: uploadError } = await supabase.storage
      .from("photoshoots")
      .upload(fileName, buffer, { contentType: "image/png", upsert: true });

    if (uploadError) {
      console.error("[Re-mirror] Upload failed:", uploadError.message);
      return NextResponse.json({ status: "failed", error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from("photoshoots").getPublicUrl(fileName);

    await supabase
      .from("generations")
      .update({ output_image_url: publicUrl })
      .eq("prediction_id", prediction_id);

    return NextResponse.json({ status: "mirrored", url: publicUrl });

  } catch (err) {
    console.error("Mirror endpoint error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
