import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../services/baseApi';
import { api } from '../services/api';

api.enhanceEndpoints({
  addTagTypes: ['Categories', 'Orders'],
  endpoints: {
    getOrdersByShop: {
      providesTags: (_result, _error, arg) => [
        { type: 'Orders' as const, id: `LIST-${arg.shopId}` },
      ],
    },
    getCategoriesByShop: {
      providesTags: (_result, _error, arg) => [
        { type: 'Categories' as const, id: `LIST-${arg.shopId}` },
      ],
    },
    createCategory: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Categories' as const, id: `LIST-${arg.shopId}` },
      ],
    },
    updateCategory: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Categories' as const, id: `LIST-${arg.shopId}` },
      ],
    },
    deleteCategory: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Categories' as const, id: `LIST-${arg.shopId}` },
      ],
    },
    getProductsByShop: {
      providesTags: (_result, _error, arg) => [
        { type: 'Products' as const, id: `LIST-${arg.shopId}` },
      ],
    },
    updateProduct: {
      invalidatesTags: (_result, _error, arg) =>
        arg.updateProductRequest.shopId
          ? [{ type: 'Products' as const, id: `LIST-${arg.updateProductRequest.shopId}` }]
          : [{ type: 'Products' as const, id: 'LIST' }],
    },
    addProductImage: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Products' as const, id: `LIST-${arg.shopId}` },
      ],
    },
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
