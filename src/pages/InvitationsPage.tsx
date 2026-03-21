import { useTranslation } from 'react-i18next';
import {
  useGetMyInvitationsQuery,
  useAcceptShopInvitationMutation,
  useDeclineShopInvitationMutation,
} from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassSpinner } from '../components/ui/GlassSpinner';
import { useToast } from '../contexts/ToastContext';

export function InvitationsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { data, isLoading, isError, refetch } = useGetMyInvitationsQuery();
  const [acceptShopInvitation] = useAcceptShopInvitationMutation();
  const [declineShopInvitation] = useDeclineShopInvitationMutation();

  const handleAccept = async (shopId: string) => {
    try {
      await acceptShopInvitation({ shopId }).unwrap();
      toast.success(t('invitations.acceptSuccess'));
      refetch();
    } catch {
      toast.error(t('invitations.acceptFailed'));
    }
  };

  const handleDecline = async (shopId: string) => {
    try {
      await declineShopInvitation({ shopId }).unwrap();
      toast.success(t('invitations.declineSuccess'));
      refetch();
    } catch {
      toast.error(t('invitations.declineFailed'));
    }
  };

  if (isLoading) return <GlassSpinner label={t('invitations.loading')} />;
  if (isError) return <p className="text-red-500">{t('invitations.loadError')}</p>;

  const invitations = data?.invitations ?? [];

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">{t('invitations.title')}</h1>
      {invitations.length === 0 ? (
        <GlassCard className="p-5">
          <p className="text-sm text-gray-400">{t('invitations.empty')}</p>
        </GlassCard>
      ) : (
        <GlassCard className="p-5 space-y-0">
          {invitations.map((invite, i) => (
            <div
              key={invite.shopId}
              className={`flex items-center justify-between py-4 ${
                i > 0 ? 'border-t border-gray-200' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{invite.shopName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t('invitations.role')}: {invite.role}
                </p>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleAccept(invite.shopId)}
                >
                  {t('invitations.accept')}
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDecline(invite.shopId)}
                >
                  {t('invitations.decline')}
                </GlassButton>
              </div>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
