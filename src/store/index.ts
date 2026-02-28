import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';

// Import generated API to ensure endpoints are registered
import { generatedApi } from './api/generatedApi';

generatedApi.enhanceEndpoints({
  addTagTypes: ['Products'],
  endpoints: {
    getProductsByShop: { providesTags: ['Products'] },
    updateProduct:     { invalidatesTags: ['Products'] },
    addProductImage:   { invalidatesTags: ['Products'] },
  },
});

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
