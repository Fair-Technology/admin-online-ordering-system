import { generatedApi } from './generatedApi';

/**
 * Enhances the generated API with cache tag configuration so mutations
 * automatically invalidate the relevant query caches.
 *
 * Import category and product hooks from this file instead of generatedApi.
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
  },
});

export const {
  useGetCategoriesByShopQuery,
  useCreateCategoryMutation,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsByShopQuery,
  useUpdateProductMutation,
} = enhancedApi;
