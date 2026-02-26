import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';

// Import injected APIs to ensure their endpoints are registered
import './api/shopsApi';
import './api/categoriesApi';
import './api/productsApi';
import './api/imagesApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
