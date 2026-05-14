import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { createClient } from "@/utils/supabase/server";
import { PLANS } from "@/utils/subscriptionUtils";

export async function POST(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const plan = body?.plan;
  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const client = new DodoPayments({
    bearerToken: process.env.DODO_API_KEY,
    environment: process.env.DODO_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Determine which studio page to return to based on user's business_type
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_type")
    .eq("id", user.id)
    .single();

  const studio = profile?.business_type === "jewelry" ? "jewelry" : "clothing";
  const returnUrl = `${appUrl}/studio/${studio}?payment=success`;
  const cancelUrl = `${appUrl}/studio/${studio}`;

  try {
    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: PLANS[plan].productId, quantity: 1 }],
      customer: { email: user.email, name: user.user_metadata?.full_name ?? user.email },
      return_url: returnUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        plan,
      },
    });

    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (err) {
    const message = err?.message ?? "Unknown error";
    const status = err?.status ?? err?.statusCode ?? 500;
    console.error("[checkout] DodoPayments error:", status, message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
