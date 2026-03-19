import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginRequest } from '../config/msalConfig';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import bgImage from '../assets/background-image.jpg';

export function LoginPage() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { t } = useTranslation();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm px-4">
        {inProgress !== InteractionStatus.None ? (
          <p className="text-center text-white/50">{t('auth.loading')}</p>
        ) : (
          <GlassCard className="p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-semibold text-white">{t('auth.adminPortal')}</h1>
              <p className="text-sm text-white/45 mt-1">{t('auth.signInSubtitle')}</p>
            </div>

            <div className="flex flex-col gap-3">
              <GlassButton
                className="w-full"
                onClick={() => instance.loginRedirect(loginRequest)}
              >
                {t('auth.signIn')}
              </GlassButton>
              <GlassButton
                variant="secondary"
                className="w-full"
                onClick={() => instance.loginRedirect({ ...loginRequest, prompt: 'create' })}
              >
                {t('auth.createAccount')}
              </GlassButton>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
