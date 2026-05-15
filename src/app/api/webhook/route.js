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

async function findUserId(supabase, sub) {
  // 1. Try metadata.user_id (set during checkout)
  if (sub.metadata?.user_id) {
    console.log("[webhook] found user via metadata:", sub.metadata.user_id);
    return sub.metadata.user_id;
  }

  // 2. Fallback: look up by customer email via auth admin API
  const email = sub.customer?.email;
  if (email) {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error("[webhook] listUsers error:", error);
      return null;
    }
    const u = data?.users?.find((x) => x.email?.toLowerCase() === email.toLowerCase());
    if (u) {
      console.log("[webhook] found user via email:", u.id);
      return u.id;
    }
    console.warn("[webhook] no user matching email:", email);
  }

  return null;
}

export async function POST(req) {
  const rawBody = await req.text();

  const headers = {};
  req.headers.forEach((value, key) => { headers[key] = value; });

  console.log("[webhook] received request");

  const client = new DodoPayments({
    bearerToken: process.env.DODO_API_KEY,
    webhookKey: process.env.DODO_WEBHOOK_SECRET,
    environment: process.env.DODO_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  });

  let event;
  try {
    event = client.webhooks.unwrap(rawBody, {
      headers,
      key: process.env.DODO_WEBHOOK_SECRET,
    });
  } catch (err) {
    console.error("[webhook] signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  console.log("[webhook] event type:", event.type, "data keys:", Object.keys(event.data || {}));

  const supabase = getServiceClient();
  const type = event.type;
  const sub = event.data;

  try {
    if (type === "subscription.active") {
      const plan = planFromProductId(sub.product_id);
      if (!plan) {
        console.warn("[webhook] unknown product_id:", sub.product_id);
        return NextResponse.json({ received: true });
      }

      const userId = await findUserId(supabase, sub);
      if (!userId) {
        console.error("[webhook] could not identify user for subscription", sub.subscription_id);
        return NextResponse.json({ received: true });
      }

      // Idempotency: skip if this subscription_id already saved on this user
      const { data: existing } = await supabase
        .from("profiles")
        .select("subscription_id")
        .eq("id", userId)
        .maybeSingle();

      if (existing?.subscription_id === sub.subscription_id) {
        console.log("[webhook] already processed:", sub.subscription_id);
        return NextResponse.json({ received: true });
      }

      const { data: updated, error: updateErr } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          plan,
          subscription_id: sub.subscription_id,
          subscription_status: "active",
          dodo_customer_id: sub.customer?.customer_id ?? null,
          credits_remaining: PLANS[plan].credits,
          credits_limit: PLANS[plan].credits,
          credits_reset_at: sub.next_billing_date ?? getNextResetDate(),
          plan_expires_at: null,
        }, { onConflict: "id" })
        .select();

      if (updateErr) {
        console.error("[webhook] upsert error:", updateErr);
      } else {
        console.log("[webhook] upserted user", userId, "to plan", plan, "rows:", updated?.length);
      }
    } else if (type === "subscription.renewed") {
      const plan = planFromProductId(sub.product_id);
      if (!plan) return NextResponse.json({ received: true });

      await supabase.from("profiles").update({
        subscription_status: "active",
        credits_remaining: PLANS[plan].credits,
        credits_limit: PLANS[plan].credits,
        credits_reset_at: sub.next_billing_date ?? getNextResetDate(),
        plan_expires_at: null,
      }).eq("subscription_id", sub.subscription_id);
    } else if (type === "subscription.cancelled" || type === "subscription.expired") {
      await supabase.from("profiles").update({
        subscription_status: type === "subscription.expired" ? "expired" : "cancelled",
        plan_expires_at: sub.next_billing_date ?? new Date().toISOString(),
      }).eq("subscription_id", sub.subscription_id);
    } else if (type === "subscription.on_hold" || type === "subscription.failed") {
      await supabase.from("profiles").update({
        subscription_status: type === "subscription.on_hold" ? "on_hold" : "failed",
      }).eq("subscription_id", sub.subscription_id);
    } else {
      console.log("[webhook] unhandled event type:", type);
    }
  } catch (err) {
    console.error("[webhook] handler error:", err);
    // Return 200 anyway so DodoPayments doesn't retry the same broken event
  }

  return NextResponse.json({ received: true });
}
