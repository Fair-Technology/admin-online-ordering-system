import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { msalInstance, apiRequest } from '../auth/msalConfig';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: async (headers) => {
    const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
    if (account) {
      try {
        const result = await msalInstance.acquireTokenSilent({ ...apiRequest, account });
        headers.set('Authorization', `Bearer ${result.accessToken}`);
      } catch {
        // Silent acquisition failed — redirect to login
        msalInstance.loginRedirect(apiRequest);
      }
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: rawBaseQuery,
  tagTypes: ['Products', 'Categories'],
  endpoints: () => ({}),
});
