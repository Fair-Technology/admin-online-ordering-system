import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetOrdersByShopQuery } from '../services/api';
import type { GetOrdersByShopApiResponse } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassSpinner } from '../components/ui/GlassSpinner';

type Order = NonNullable<GetOrdersByShopApiResponse>[number];

const STATUS_COLORS: Record<Order['status'], string> = {
  paid: 'bg-green-500/20 text-green-300 border border-green-400/30',
  pending_payment: 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30',
  failed: 'bg-red-500/20 text-red-300 border border-red-400/30',
  cancelled: 'bg-white/10 text-white/50 border border-white/20',
  refunded: 'bg-white/10 text-white/50 border border-white/20',
};

function formatCurrency(cents: number, currency: string): string {
  return `$${(cents / 100).toFixed(2)} ${currency}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface OrderRowProps {
  order: Order;
}

function OrderRow({ order }: OrderRowProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className="px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-semibold text-white">{order.orderRef}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
              {t(`orders.status.${order.status}`)}
            </span>
          </div>
          <span className="text-sm font-semibold text-white">
            {formatCurrency(order.subtotalCents, order.currency)}
          </span>
        </div>
        <div className="mt-1 flex flex-col gap-0.5 text-sm text-white/60">
          <span>{order.customerName} &middot; {order.customerEmail} &middot; {order.customerPhone}</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 bg-black/10">
          <div className="divide-y divide-white/8 rounded-xl overflow-hidden border border-white/10">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="text-white/80">
                  {item.productName} &times; {item.quantity} @ {formatCurrency(item.unitPriceCents, order.currency)}
                </span>
                <span className="text-white font-medium">
                  {formatCurrency(item.lineTotalCents, order.currency)}
                </span>
              </div>
            ))}
          </div>
          {order.customerNotes && (
            <p className="mt-2 text-xs text-white/50 italic">&ldquo;{order.customerNotes}&rdquo;</p>
          )}
        </div>
      )}
    </>
  );
}

export function OrdersPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { t } = useTranslation();
  const { data: orders, isLoading, isError } = useGetOrdersByShopQuery({ shopId: shopId! });

  if (isLoading) return <GlassSpinner label={t('orders.loading')} />;
  if (isError) return <p className="text-red-400">{t('orders.loadError')}</p>;

  return (
    <div className="space-y-4">
      <GlassCard>
        {(!orders || orders.length === 0) ? (
          <p className="p-5 text-white/40 text-sm">{t('orders.empty')}</p>
        ) : (
          <div className="divide-y divide-white/8">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
