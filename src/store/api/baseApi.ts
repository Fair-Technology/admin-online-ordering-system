import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// TODO: Inject Microsoft Entra JWT token here when auth is implemented
// prepareHeaders: (headers, { getState }) => {
//   const token = selectAccessToken(getState());
//   if (token) headers.set('Authorization', `Bearer ${token}`);
//   return headers;
// }

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: () => ({}),
});
