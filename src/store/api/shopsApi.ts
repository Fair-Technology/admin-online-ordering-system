import { baseApi } from './baseApi';
import type {
  Shop,
  GetAllShopsResponse,
  CreateShopRequest,
  UpdateShopRequest,
  DeleteResponse,
} from '../../types/api';

export const shopsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShops: builder.query<GetAllShopsResponse, void>({
      query: () => '/shops',
    }),
    getShopById: builder.query<Shop, string>({
      query: (shopId) => `/shops/${shopId}`,
    }),
    createShop: builder.mutation<Shop, CreateShopRequest>({
      query: (body) => ({
        url: '/shops',
        method: 'POST',
        body,
      }),
    }),
    updateShop: builder.mutation<Shop, { shopId: string; body: UpdateShopRequest }>({
      query: ({ shopId, body }) => ({
        url: `/shops/${shopId}`,
        method: 'PATCH',
        body,
      }),
    }),
    deleteShop: builder.mutation<DeleteResponse, string>({
      query: (shopId) => ({
        url: `/shops/${shopId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetShopsQuery,
  useGetShopByIdQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
  useDeleteShopMutation,
} = shopsApi;
