export const PLANS = {
  starter: {
    productId: process.env.DODO_PRODUCT_ID_STARTER,
    credits: 150,
    price: 49,
    label: 'Starter',
  },
  pro: {
    productId: process.env.DODO_PRODUCT_ID_PRO,
    credits: 500,
    price: 99,
    label: 'Pro',
  },
};

// Returns { allowed: bool, reason: 'free' | 'no_credits' | 'expired' | null }
export function canAccess(profile) {
  if (!profile || profile.plan === 'free') return { allowed: false, reason: 'free' };
  if (profile.subscription_status !== 'active') {
    const expired =
      !profile.plan_expires_at || new Date(profile.plan_expires_at) < new Date();
    if (expired) return { allowed: false, reason: 'expired' };
  }
  if (profile.credits_remaining <= 0) return { allowed: false, reason: 'no_credits' };
  return { allowed: true, reason: null };
}

export function getNextResetDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

// Map a DodoPayments product_id to a plan key
export function planFromProductId(productId) {
  return Object.entries(PLANS).find(([, v]) => v.productId === productId)?.[0] ?? null;
}
