import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { msalInstance, loginRequest } from '../auth/msalConfig';

// TODO: Add API-specific scope for backend access once configured, e.g.:
// scopes: ['api://{backendClientId}/user_impersonation']
// Until then, the access token from openid/profile scopes may not be accepted by Azure Functions.

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: async (headers) => {
    const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
    if (account) {
      try {
        const result = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
        // No dedicated API scope is registered in Entra yet, so result.accessToken is a
        // Microsoft Graph token (aud: 00000003-..., iss: sts.windows.net) which the
        // backend cannot verify against CIAM JWKS. Use the ID token instead — it is
        // always issued by the CIAM tenant (iss: https://{tenantId}.ciamlogin.com/...)
        // and verifiable against the CIAM JWKS endpoint. Switch to result.accessToken
        // once a dedicated API scope is registered in Entra.
        headers.set('Authorization', `Bearer ${result.idToken}`);
      } catch {
        // Silent acquisition failed — redirect to login
        msalInstance.loginRedirect(loginRequest);
      }
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: rawBaseQuery,
  tagTypes: ['Products'],
  endpoints: () => ({}),
});
