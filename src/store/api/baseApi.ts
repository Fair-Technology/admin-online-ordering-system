import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { msalInstance, loginRequest } from '../../auth/msalConfig';

// TODO: Add API-specific scope for backend access once configured, e.g.:
// scopes: ['api://{backendClientId}/user_impersonation']
// Until then, the access token from openid/profile scopes may not be accepted by Azure Functions.

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: async (headers) => {
    const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
    if (account) {
      try {
        const result = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
        headers.set('Authorization', `Bearer ${result.accessToken}`);
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
  endpoints: () => ({}),
});
