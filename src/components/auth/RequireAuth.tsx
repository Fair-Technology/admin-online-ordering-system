import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function RequireAuth() {
  const { inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { t } = useTranslation();

  if (inProgress !== InteractionStatus.None) {
    return <div>{t('auth.loading')}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
