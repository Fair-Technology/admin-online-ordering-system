import { baseApi } from './baseApi';
import type {
  Product,
  ProductsResponse,
  CreateProductRequest,
  UpdateProductRequest,
  DeleteResponse,
} from '../../types/api';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductsByShop: builder.query<ProductsResponse, string>({
      query: (shopId) => ({ url: '/products', params: { shopId } }),
    }),
    getProductById: builder.query<Product, { productId: string; shopId: string }>({
      query: ({ productId, shopId }) => ({
        url: `/products/${productId}`,
        params: { shopId },
      }),
    }),
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
    }),
    updateProduct: builder.mutation<Product, { productId: string; body: UpdateProductRequest }>({
      query: ({ productId, body }) => ({
        url: `/products/${productId}`,
        method: 'PATCH',
        body,
      }),
    }),
    deleteProduct: builder.mutation<DeleteResponse, { productId: string; shopId: string }>({
      query: ({ productId, shopId }) => ({
        url: `/products/${productId}`,
        method: 'DELETE',
        params: { shopId },
      }),
    }),
  }),
});

export const {
  useGetProductsByShopQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
