import { baseApi } from './baseApi';
import type {
  Category,
  CategoriesResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../types/api';

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategoriesByShop: builder.query<CategoriesResponse, string>({
      query: (shopId) => `/shops/${shopId}/categories`,
    }),
    getCategoryById: builder.query<Category, { shopId: string; categoryId: string }>({
      query: ({ shopId, categoryId }) => `/shops/${shopId}/categories/${categoryId}`,
    }),
    createCategory: builder.mutation<Category, { shopId: string; body: CreateCategoryRequest }>({
      query: ({ shopId, body }) => ({
        url: `/shops/${shopId}/categories`,
        method: 'POST',
        body,
      }),
    }),
    updateCategory: builder.mutation<
      Category,
      { shopId: string; categoryId: string; body: UpdateCategoryRequest }
    >({
      query: ({ shopId, categoryId, body }) => ({
        url: `/shops/${shopId}/categories/${categoryId}`,
        method: 'PATCH',
        body,
      }),
    }),
    deleteCategory: builder.mutation<Category, { shopId: string; categoryId: string }>({
      query: ({ shopId, categoryId }) => ({
        url: `/shops/${shopId}/categories/${categoryId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetCategoriesByShopQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
