import { generatedApi } from './generatedApi';

/**
 * Enhances the generated API with cache tag configuration so mutations
 * automatically invalidate the relevant query caches.
 *
 * Import category-related hooks from this file instead of generatedApi.
 */
export const enhancedApi = generatedApi.enhanceEndpoints({
  addTagTypes: ['Categories'],
  endpoints: {
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
  },
});

export const {
  useGetCategoriesByShopQuery,
  useCreateCategoryMutation,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = enhancedApi;
