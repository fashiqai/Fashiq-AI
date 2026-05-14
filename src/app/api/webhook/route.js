import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { createClient } from "@supabase/supabase-js";
import { PLANS, planFromProductId, getNextResetDate } from "@/utils/subscriptionUtils";

export const dynamic = "force-dynamic";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(req) {
  const rawBody = await req.text();

  // Collect all headers as a plain object for the SDK unwrap helper
  const headers = {};
  req.headers.forEach((value, key) => { headers[key] = value; });

  const client = new DodoPayments({
    bearerToken: process.env.DODO_API_KEY,
    webhookKey: process.env.DODO_WEBHOOK_SECRET,
  });

  let event;
  try {
    event = client.webhooks.unwrap(rawBody, {
      headers,
      key: process.env.DODO_WEBHOOK_SECRET,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const type = event.type;

  if (type === "subscription.active") {
    const sub = event.data;
    const plan = planFromProductId(sub.product_id);
    if (!plan) {
      return NextResponse.json({ received: true }); // unknown product, skip
    }

    const userId = sub.metadata?.user_id;

    // Idempotency: skip if already processed for this subscription_id
    const { data: existing } = await supabase
      .from("profiles")
      .select("subscription_id")
      .eq("subscription_id", sub.subscription_id)
      .maybeSingle();

    if (existing) return NextResponse.json({ received: true });

    if (userId) {
      await supabase.from("profiles").update({
        plan,
        subscription_id: sub.subscription_id,
        subscription_status: "active",
        dodo_customer_id: sub.customer?.customer_id ?? null,
        credits_remaining: PLANS[plan].credits,
        credits_limit: PLANS[plan].credits,
        credits_reset_at: getNextResetDate(),
        plan_expires_at: null,
      }).eq("id", userId);
    } else {
      // Fallback: look up by customer email via auth.users
      const { data: users } = await supabase
        .from("auth.users")
        .select("id")
        .eq("email", sub.customer?.email)
        .limit(1);

      const uid = users?.[0]?.id;
      if (uid) {
        await supabase.from("profiles").update({
          plan,
          subscription_id: sub.subscription_id,
          subscription_status: "active",
          dodo_customer_id: sub.customer?.customer_id ?? null,
          credits_remaining: PLANS[plan].credits,
          credits_limit: PLANS[plan].credits,
          credits_reset_at: getNextResetDate(),
          plan_expires_at: null,
        }).eq("id", uid);
      }
    }
  } else if (type === "subscription.renewed") {
    const sub = event.data;
    const plan = planFromProductId(sub.product_id);
    if (!plan) return NextResponse.json({ received: true });

    await supabase.from("profiles").update({
      subscription_status: "active",
      credits_remaining: PLANS[plan].credits,
      credits_limit: PLANS[plan].credits,
      credits_reset_at: getNextResetDate(),
      plan_expires_at: null,
    }).eq("subscription_id", sub.subscription_id);
  } else if (type === "subscription.cancelled" || type === "subscription.expired") {
    const sub = event.data;
    await supabase.from("profiles").update({
      subscription_status: type === "subscription.expired" ? "expired" : "cancelled",
      plan_expires_at: sub.next_billing_date ?? new Date().toISOString(),
    }).eq("subscription_id", sub.subscription_id);
  } else if (type === "subscription.on_hold" || type === "subscription.failed") {
    const sub = event.data;
    await supabase.from("profiles").update({
      subscription_status: type === "subscription.on_hold" ? "on_hold" : "failed",
    }).eq("subscription_id", sub.subscription_id);
  }

  return NextResponse.json({ received: true });
}
