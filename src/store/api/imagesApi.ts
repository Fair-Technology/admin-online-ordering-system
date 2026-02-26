import { baseApi } from './baseApi';
import type {
  GenerateImageUploadUrlRequest,
  GenerateImageUploadUrlResponse,
  AddProductImageRequest,
  ProductImageResponse,
} from '../../types/api';

export const imagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateUploadUrl: builder.mutation<
      GenerateImageUploadUrlResponse,
      { shopId: string; productId: string; body: GenerateImageUploadUrlRequest }
    >({
      query: ({ shopId, productId, body }) => ({
        url: `/shops/${shopId}/products/${productId}/images/upload-url`,
        method: 'POST',
        body,
      }),
    }),
    addProductImage: builder.mutation<
      ProductImageResponse,
      { shopId: string; productId: string; body: AddProductImageRequest }
    >({
      query: ({ shopId, productId, body }) => ({
        url: `/shops/${shopId}/products/${productId}/images`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGenerateUploadUrlMutation, useAddProductImageMutation } = imagesApi;
