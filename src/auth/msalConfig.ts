import { PublicClientApplication } from '@azure/msal-browser';
import type { Configuration, RedirectRequest } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: `https://${import.meta.env.VITE_MSAL_TENANT_NAME}.ciamlogin.com/${import.meta.env.VITE_MSAL_TENANT_ID}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: { cacheLocation: 'sessionStorage' },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile', 'offline_access'],
};
