"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { canAccess } from "@/utils/subscriptionUtils";

export function useSubscription() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const pollRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const { data } = await supabase
      .from("profiles")
      .select("plan, credits_remaining, credits_limit, credits_reset_at, subscription_status, plan_expires_at")
      .eq("id", user.id)
      .single();

    setProfile(data);
    setIsLoading(false);
    return data;
  }, []);

  // Handle ?payment=success redirect — poll until isPaid flips true
  useEffect(() => {
    fetchProfile();

    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") !== "success") return;

    // Clean the URL immediately so a reload won't re-trigger
    window.history.replaceState({}, "", window.location.pathname);

    let attempts = 0;
    const MAX = 12;

    pollRef.current = setInterval(async () => {
      attempts++;
      const data = await fetchProfile();
      const { allowed } = canAccess(data);
      if (allowed || attempts >= MAX) {
        clearInterval(pollRef.current);
      }
    }, 2000);

    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(() => fetchProfile(), [fetchProfile]);

  const { allowed: isPaid, reason: blockReason } = canAccess(profile);

  return {
    profile,
    isPaid,
    blockReason,
    creditsRemaining: profile?.credits_remaining ?? 0,
    creditsLimit: profile?.credits_limit ?? 0,
    creditsResetAt: profile?.credits_reset_at ?? null,
    plan: profile?.plan ?? "free",
    isLoading,
    refresh,
  };
}
