import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMsal } from '@azure/msal-react';
import { CheckCircle2 } from 'lucide-react';
import {
  useGetShopByIdQuery,
  useGetShopSubscriptionQuery,
  useGetVisiblePlansQuery,
  useGetPlanPricingQuery,
  useCreateSubscriptionCheckoutMutation,
} from '../services/api';
import type { PlanResponse } from '../services/api';
import { GlassSpinner } from '../components/ui/GlassSpinner';

// Taglines shown beneath each plan name, indexed by sort position
const PLAN_TAGLINES = [
  'Everything you need to start taking orders online.',
  'Perfect for growing shops with higher volume.',
  'Built for busy venues that need maximum power.',
  'Enterprise-grade with zero limits on your business.',
];

// Base features every plan includes
const BASE_FEATURES = [
  'Online ordering storefront',
  'Product catalog management',
  'Real-time order dashboard',
  'Customer email notifications',
  'Basic analytics & reporting',
];

// Extra features unlocked on paid plans
const PAID_FEATURES = [
  'Custom branding & colours',
  'Advanced analytics & reports',
  'Multiple staff accounts',
  'Priority support',
];

function formatLimitKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

interface PlanCardProps {
  plan: PlanResponse;
  index: number;
  currency: string;
  billingInterval: 'monthly' | 'yearly';
  isCurrentPlan: boolean;
  isDowngrade: boolean;
  isOwner: boolean;
  onUpgrade: (planId: string) => void;
  isUpgrading: boolean;
}

function PlanCard({
  plan,
  index,
  currency,
  billingInterval,
  isCurrentPlan,
  isDowngrade,
  isOwner,
  onUpgrade,
  isUpgrading,
}: PlanCardProps) {
  const { t } = useTranslation();
  const { data: pricingList } = useGetPlanPricingQuery({ planId: plan.id });

  // Match by currency only — don't filter by isActive so partially-configured plans still show a price
  const pricing = pricingList?.find(
    (p) => p.currency.toUpperCase() === currency.toUpperCase(),
  );

  const isFree = plan.internalKey === 'free';
  const tagline = PLAN_TAGLINES[index] ?? 'The right plan for your business.';

  // Price resolution — show amount whenever it exists; canUpgrade requires a Stripe price ID too
  let priceDisplay = '';
  let periodLabel = '';
  let hasPrice = false;

  if (isFree) {
    priceDisplay = t('subscription.free');
  } else if (pricing) {
    const amount =
      billingInterval === 'monthly' ? pricing.monthlyAmountCents : pricing.yearlyAmountCents;
    if (amount > 0) {
      priceDisplay = formatPrice(amount, currency);
      periodLabel = billingInterval === 'monthly' ? t('subscription.perMonth') : t('subscription.perYear');
      hasPrice = true;
    }
  }

  // Build feature list: real limits first, then base + paid extras
  const limitFeatures = plan.limits.map(
    (l) => `${l.value === -1 ? 'Unlimited' : l.value.toLocaleString()} ${formatLimitKey(l.key)}`,
  );
  const staticFeatures = isFree ? BASE_FEATURES : [...BASE_FEATURES, ...PAID_FEATURES];
  const features = limitFeatures.length > 0 ? [...limitFeatures, ...staticFeatures] : staticFeatures;

  return (
    <div
      className={`relative flex flex-col flex-1 min-w-[220px] rounded-2xl backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-200 ${
        isCurrentPlan
          ? 'bg-white/15 border border-emerald-400/40'
          : 'bg-white/10 border border-white/20 hover:bg-white/13 hover:border-white/30'
      }`}
    >
      {/* Top shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            {t('subscription.currentPlanBadge')}
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-6">
        {/* Plan name + tagline */}
        <div className="mb-6 pr-6">
          <h3 className="text-xl font-bold text-white mb-1.5">{plan.name}</h3>
          <p className="text-sm text-white/50 leading-relaxed">{tagline}</p>
        </div>

        {/* Price */}
        <div className="mb-7">
          {isFree ? (
            <p className="text-4xl font-bold text-white">{t('subscription.free')}</p>
          ) : hasPrice ? (
            <div className="flex items-baseline gap-2.5">
              <p className="text-4xl font-bold text-white">{priceDisplay}</p>
              <span className="text-sm text-white/50">{periodLabel}</span>
            </div>
          ) : (
            <p className="text-2xl font-semibold text-white/40">—</p>
          )}
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-3 flex-1 mb-8">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-white/75">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA button — pinned to bottom, always rendered */}
        {isCurrentPlan ? (
          <div className="w-full py-2.5 rounded-xl text-sm font-medium bg-white/6 border border-white/10 text-white/35 text-center cursor-default select-none">
            {t('subscription.currentPlanBadge')}
          </div>
        ) : isDowngrade && isOwner ? (
          <button
            onClick={() => onUpgrade(plan.id)}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-red-500/80 hover:bg-red-500 text-white border border-red-400/40 shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_28px_rgba(239,68,68,0.5)] transition-all duration-150"
          >
            {`${t('subscription.downgrade')} to ${plan.name}`}
          </button>
        ) : isOwner && !isFree ? (
          <button
            disabled={isUpgrading}
            onClick={() => onUpgrade(plan.id)}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_24px_rgba(52,211,153,0.45)] hover:shadow-[0_4px_32px_rgba(52,211,153,0.65)] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUpgrading ? t('subscription.upgrading') : `${t('subscription.upgrade')} to ${plan.name}`}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function SubscriptionPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { t } = useTranslation();
  const { accounts } = useMsal();
  const [searchParams, setSearchParams] = useSearchParams();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);

  const currentUserId = accounts[0]?.localAccountId;

  const { data: shop, isLoading: shopLoading } = useGetShopByIdQuery({ shopId: shopId! });
  const { data: subscriptionData, isLoading: subLoading } = useGetShopSubscriptionQuery(
    { shopId: shopId! },
    { refetchOnMountOrArgChange: true },
  );
  const { data: plansData, isLoading: plansLoading } = useGetVisiblePlansQuery();
  const [createSubscriptionCheckout] = useCreateSubscriptionCheckoutMutation();

  const paymentParam = searchParams.get('payment');

  function dismissBanner() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('payment');
      return next;
    });
  }

  const isOwner =
    (shop?.members ?? []).find((m) => m.userId === currentUserId && m.isActive)?.role === 'owner';

  const subscription = subscriptionData?.subscription;

  async function handleUpgrade(planId: string) {
    if (!shopId) return;
    setUpgradeError(null);
    setUpgradingPlanId(planId);
    try {
      const result = await createSubscriptionCheckout({ shopId, planId, billingInterval }).unwrap();
      window.location.href = result.url;
    } catch {
      setUpgradeError(t('subscription.upgradeError'));
      setUpgradingPlanId(null);
    }
  }

  if (shopLoading || subLoading || plansLoading) {
    return <GlassSpinner label={t('subscription.loading')} />;
  }

  const currency = shop?.currency ?? 'USD';
  const plans = plansData?.plans ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Payment result banners */}
      {paymentParam === 'success' && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm">
          <span>{t('subscription.paymentSuccess')}</span>
          <button
            onClick={dismissBanner}
            className="text-emerald-300/60 hover:text-emerald-300 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
      {paymentParam === 'cancelled' && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm">
          <span>{t('subscription.paymentCancelled')}</span>
          <button
            onClick={dismissBanner}
            className="text-amber-300/60 hover:text-amber-300 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Header row: title left, toggle right */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t('nav.subscription')}</h2>
          {subscription && (
            <p className="text-sm text-white/45 mt-1">
              <span className="capitalize">{subscription.status}</span>
              {subscription.currentPeriodEnd && (
                <>
                  {' · '}
                  {t('subscription.periodEnd')}{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </>
              )}
              {subscription.planSource === 'superadmin_override' && (
                <> · {t('subscription.overrideNote')}</>
              )}
            </p>
          )}
        </div>

        {/* Pill toggle matching the screenshot */}
        <div className="flex items-center p-1 rounded-xl bg-white/10 border border-white/15 shrink-0">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
              billingInterval === 'monthly'
                ? 'bg-white/20 text-white border border-white/20 shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {t('subscription.monthly')}
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
              billingInterval === 'yearly'
                ? 'bg-white/20 text-white border border-white/20 shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {t('subscription.yearly')}
          </button>
        </div>
      </div>

      {/* Plan cards */}
      {plans.length > 0 && (
        <div className="flex gap-4 items-stretch">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={index}
              currency={currency}
              billingInterval={billingInterval}
              isCurrentPlan={subscription?.planId === plan.id}
              isDowngrade={plan.internalKey === 'free' && subscription?.status !== 'free' && subscription?.status !== undefined}
              isOwner={isOwner}
              onUpgrade={handleUpgrade}
              isUpgrading={upgradingPlanId === plan.id}
            />
          ))}
        </div>
      )}

      {/* Upgrade error */}
      {upgradeError && <p className="text-sm text-red-400">{upgradeError}</p>}
    </div>
  );
}
