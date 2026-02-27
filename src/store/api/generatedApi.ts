import { baseApi as api } from "./baseApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getShops: build.query<GetShopsApiResponse, GetShopsApiArg>({
      query: () => ({ url: `/shops` }),
    }),
    createShop: build.mutation<CreateShopApiResponse, CreateShopApiArg>({
      query: (queryArg) => ({
        url: `/shops`,
        method: "POST",
        body: queryArg.createShopRequest,
      }),
    }),
    getShopBySlug: build.query<GetShopBySlugApiResponse, GetShopBySlugApiArg>({
      query: (queryArg) => ({ url: `/shops/slug/${queryArg.slug}` }),
    }),
    getMyShops: build.query<GetMyShopsApiResponse, GetMyShopsApiArg>({
      query: () => ({ url: `/shops/me` }),
    }),
    getShopById: build.query<GetShopByIdApiResponse, GetShopByIdApiArg>({
      query: (queryArg) => ({ url: `/shops/${queryArg.shopId}` }),
    }),
    updateShop: build.mutation<UpdateShopApiResponse, UpdateShopApiArg>({
      query: (queryArg) => ({
        url: `/shops/${queryArg.shopId}`,
        method: "PATCH",
        body: queryArg.updateShopRequest,
      }),
    }),
    deleteShop: build.mutation<DeleteShopApiResponse, DeleteShopApiArg>({
      query: (queryArg) => ({
        url: `/shops/${queryArg.shopId}`,
        method: "DELETE",
      }),
    }),
    getCategoriesByShop: build.query<
      GetCategoriesByShopApiResponse,
      GetCategoriesByShopApiArg
    >({
      query: (queryArg) => ({ url: `/shops/${queryArg.shopId}/categories` }),
    }),
    createCategory: build.mutation<
      CreateCategoryApiResponse,
      CreateCategoryApiArg
    >({
      query: (queryArg) => ({
        url: `/shops/${queryArg.shopId}/categories`,
        method: "POST",
        body: queryArg.createCategoryRequest,
      }),
    }),
    getCategoryById: build.query<
      GetCategoryByIdApiResponse,
      GetCategoryByIdApiArg
    >({
      query: (queryArg) => ({
        url: `/shops/${queryArg.shopId}/categories/${queryArg.categoryId}`,
      }),
    }),
    updateCategory: build.mutation<
      UpdateCategoryApiResponse,
      UpdateCategoryApiArg
    >({
      query: (queryArg) => ({
        url: `/shops/${queryArg.shopId}/categories/${queryArg.categoryId}`,
        method: "PATCH",
        body: queryArg.updateCategoryRequest,
      }),
    }),
    deleteCategory: build.mutation<
      DeleteCategoryApiResponse,
      DeleteCategoryApiArg
    >({
      query: (queryArg) => ({
        url: `/shops/${queryArg.shopId}/categories/${queryArg.categoryId}`,
        method: "DELETE",
      }),
    }),
    getProductsByShop: build.query<
      GetProductsByShopApiResponse,
      GetProductsByShopApiArg
    >({
      query: (queryArg) => ({
        url: `/products`,
        params: {
          shopId: queryArg.shopId,
        },
      }),
    }),
    createProduct: build.mutation<
      CreateProductApiResponse,
      CreateProductApiArg
    >({
      query: (queryArg) => ({
        url: `/products`,
        method: "POST",
        body: queryArg.createProductRequest,
      }),
    }),
    getProductById: build.query<
      GetProductByIdApiResponse,
      GetProductByIdApiArg
    >({
      query: (queryArg) => ({
        url: `/products/${queryArg.productId}`,
        params: {
          shopId: queryArg.shopId,
        },
      }),
    }),
    updateProduct: build.mutation<
      UpdateProductApiResponse,
      UpdateProductApiArg
    >({
      query: (queryArg) => ({
        url: `/products/${queryArg.productId}`,
        method: "PATCH",
        body: queryArg.updateProductRequest,
      }),
    }),
    deleteProduct: build.mutation<
      DeleteProductApiResponse,
      DeleteProductApiArg
    >({
      query: (queryArg) => ({
        url: `/products/${queryArg.productId}`,
        method: "DELETE",
        params: {
          shopId: queryArg.shopId,
        },
      }),
    }),
    generateUploadUrl: build.mutation<
      GenerateUploadUrlApiResponse,
      GenerateUploadUrlApiArg
    >({
      query: (queryArg) => ({
        url: `/shops/${queryArg.shopId}/products/${queryArg.productId}/images/upload-url`,
        method: "POST",
        body: queryArg.generateImageUploadUrlRequest,
      }),
    }),
    addProductImage: build.mutation<
      AddProductImageApiResponse,
      AddProductImageApiArg
    >({
      query: (queryArg) => ({
        url: `/shops/${queryArg.shopId}/products/${queryArg.productId}/images`,
        method: "POST",
        body: queryArg.addProductImageRequest,
      }),
    }),
    createOrder: build.mutation<CreateOrderApiResponse, CreateOrderApiArg>({
      query: (queryArg) => ({
        url: `/orders`,
        method: "POST",
        body: queryArg.checkoutRequest,
      }),
    }),
    stripeWebhook: build.mutation<
      StripeWebhookApiResponse,
      StripeWebhookApiArg
    >({
      query: (queryArg) => ({
        url: `/webhooks/stripe`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type GetShopsApiResponse =
  /** status 200 List of all shops retrieved successfully */ GetAllShopsResponse;
export type GetShopsApiArg = void;
export type CreateShopApiResponse =
  /** status 200 Shop created successfully */ ShopResponse;
export type CreateShopApiArg = {
  createShopRequest: CreateShopRequest;
};
export type GetShopBySlugApiResponse =
  /** status 200 Shop retrieved successfully */ ShopResponse;
export type GetShopBySlugApiArg = {
  /** Shop slug (public identifier) */
  slug: string;
};
export type GetMyShopsApiResponse =
  /** status 200 Shops where the user is an active owner member */ GetAllShopsResponse;
export type GetMyShopsApiArg = void;
export type GetShopByIdApiResponse =
  /** status 200 Shop retrieved successfully */ ShopResponse;
export type GetShopByIdApiArg = {
  /** Shop ID */
  shopId: string;
};
export type UpdateShopApiResponse =
  /** status 200 Shop updated successfully */ ShopResponse;
export type UpdateShopApiArg = {
  /** Shop ID */
  shopId: string;
  updateShopRequest: UpdateShopRequest;
};
export type DeleteShopApiResponse =
  /** status 200 Shop deleted successfully */ DeleteResponse;
export type DeleteShopApiArg = {
  /** Shop ID */
  shopId: string;
};
export type GetCategoriesByShopApiResponse =
  /** status 200 Categories retrieved successfully */ CategoriesResponse;
export type GetCategoriesByShopApiArg = {
  /** Shop ID */
  shopId: string;
};
export type CreateCategoryApiResponse =
  /** status 200 Category created successfully */ CategoryResponse;
export type CreateCategoryApiArg = {
  /** Shop ID */
  shopId: string;
  createCategoryRequest: CreateCategoryRequest;
};
export type GetCategoryByIdApiResponse =
  /** status 200 Category retrieved successfully */ CategoryResponse;
export type GetCategoryByIdApiArg = {
  /** Shop ID */
  shopId: string;
  /** Category ID */
  categoryId: string;
};
export type UpdateCategoryApiResponse =
  /** status 200 Category updated successfully */ CategoryResponse;
export type UpdateCategoryApiArg = {
  /** Shop ID */
  shopId: string;
  /** Category ID */
  categoryId: string;
  updateCategoryRequest: UpdateCategoryRequest;
};
export type DeleteCategoryApiResponse =
  /** status 200 Category deleted successfully */ CategoryResponse;
export type DeleteCategoryApiArg = {
  /** Shop ID */
  shopId: string;
  /** Category ID */
  categoryId: string;
};
export type GetProductsByShopApiResponse =
  /** status 200 Products retrieved successfully */ ProductsResponse;
export type GetProductsByShopApiArg = {
  /** Shop ID to filter products */
  shopId: string;
};
export type CreateProductApiResponse =
  /** status 200 Product created successfully */ ProductResponse;
export type CreateProductApiArg = {
  createProductRequest: CreateProductRequest;
};
export type GetProductByIdApiResponse =
  /** status 200 Product retrieved successfully */ ProductResponse;
export type GetProductByIdApiArg = {
  /** Product ID */
  productId: string;
  /** Shop ID (required for partition key) */
  shopId: string;
};
export type UpdateProductApiResponse =
  /** status 200 Product updated successfully */ ProductResponse;
export type UpdateProductApiArg = {
  /** Product ID */
  productId: string;
  updateProductRequest: UpdateProductRequest;
};
export type DeleteProductApiResponse =
  /** status 200 Product deleted successfully */ DeleteResponse;
export type DeleteProductApiArg = {
  /** Product ID */
  productId: string;
  /** Shop ID (required for partition key) */
  shopId: string;
};
export type GenerateUploadUrlApiResponse =
  /** status 200 Upload URL generated successfully */ GenerateImageUploadUrlResponse;
export type GenerateUploadUrlApiArg = {
  /** Shop ID */
  shopId: string;
  /** Product ID */
  productId: string;
  generateImageUploadUrlRequest: GenerateImageUploadUrlRequest;
};
export type AddProductImageApiResponse =
  /** status 200 Product image added successfully */ ProductImageResponse;
export type AddProductImageApiArg = {
  /** Shop ID */
  shopId: string;
  /** Product ID */
  productId: string;
  addProductImageRequest: AddProductImageRequest;
};
export type CreateOrderApiResponse =
  /** status 200 Order created and PaymentIntent initiated */ CheckoutResponse;
export type CreateOrderApiArg = {
  checkoutRequest: CheckoutRequest;
};
export type StripeWebhookApiResponse = /** status 200 Event received */ {
  received?: boolean;
};
export type StripeWebhookApiArg = {
  body: object;
};
export type ShopBranding = {
  /** Logo URL (must start with https://) */
  logoUrl?: string | null;
  /** Hero image URL (must start with https://) */
  heroImageUrl?: string | null;
  colors: {
    /** Primary brand color (hex) */
    primary: string;
    /** Secondary brand color (hex) */
    secondary: string;
    /** Tertiary brand color (hex) */
    tertiary: string;
    /** Background color (hex) */
    background: string;
  };
} | null;
export type ShopResponse = {
  /** Shop ID */
  id?: string;
  /** Shop slug */
  slug?: string;
  /** Shop name */
  name?: string;
  /** Whether shop is deleted */
  isDeleted?: boolean;
  /** Creation timestamp */
  createdAt?: string;
  /** Last update timestamp */
  updatedAt?: string;
  /** Shop branding configuration, or null if not configured. */
  branding?: ShopBranding;
};
export type GetAllShopsResponse = {
  /** Array of shops */
  shops: ShopResponse[];
  /** Total number of shops */
  total: number;
};
export type CreateShopRequest = {
  /** Shop name (slug will be auto-generated from this) */
  name: string;
  /** Shop currency (ISO code) */
  currency: string;
  /** Shop timezone */
  timezone: string;
  /** Minimum order amount in cents */
  minOrderAmountCents: number;
  /** Payment policy */
  paymentPolicy: "pay_online";
  address: {
    /** Street address */
    street: string;
    /** City */
    city: string;
    /** State or territory */
    state: string;
    /** Postal code */
    postcode: string;
    /** Country */
    country: string;
  };
  /** Message when shop is paused (optional) */
  pausedMessage?: string;
  /** Order acceptance mode (optional, defaults to auto) */
  orderAcceptanceMode?: "auto";
  /** Shop opening hours for each day of the week. At least one day must have opening hours. */
  openingHours: {
    /** Monday opening hours */
    mon?: {
      /** Opening time in 24-hour format (HH:MM) */
      open?: string;
      /** Closing time in 24-hour format (HH:MM) */
      close?: string;
    }[];
    /** Tuesday opening hours */
    tue?: {
      /** Opening time in 24-hour format (HH:MM) */
      open?: string;
      /** Closing time in 24-hour format (HH:MM) */
      close?: string;
    }[];
    /** Wednesday opening hours */
    wed?: {
      /** Opening time in 24-hour format (HH:MM) */
      open?: string;
      /** Closing time in 24-hour format (HH:MM) */
      close?: string;
    }[];
    /** Thursday opening hours */
    thu?: {
      /** Opening time in 24-hour format (HH:MM) */
      open?: string;
      /** Closing time in 24-hour format (HH:MM) */
      close?: string;
    }[];
    /** Friday opening hours */
    fri?: {
      /** Opening time in 24-hour format (HH:MM) */
      open?: string;
      /** Closing time in 24-hour format (HH:MM) */
      close?: string;
    }[];
    /** Saturday opening hours */
    sat?: {
      /** Opening time in 24-hour format (HH:MM) */
      open?: string;
      /** Closing time in 24-hour format (HH:MM) */
      close?: string;
    }[];
    /** Sunday opening hours */
    sun?: {
      /** Opening time in 24-hour format (HH:MM) */
      open?: string;
      /** Closing time in 24-hour format (HH:MM) */
      close?: string;
    }[];
  };
  closures?: {
    id?: string;
    start?: string;
    end?: string;
    reason?: string;
  }[];
  members?: {
    userId?: string;
    role?: "owner" | "staff";
    isActive?: boolean;
  }[];
  /** Shop branding configuration (optional). Set to null to disable branding. */
  branding?: ShopBranding;
};
export type UpdateShopRequest = {
  /** Shop name */
  name?: string;
  /** Whether shop is accepting orders */
  acceptingOrders?: boolean;
  /** Whether shop is paused */
  isPaused?: boolean;
  /** Message when shop is paused */
  pausedMessage?: string;
  /** Payment policy */
  paymentPolicy?: "pay_online";
  /** Allow guest checkout */
  allowGuestCheckout?: boolean;
  /** Shop currency */
  currency?: string;
  /** Shop timezone */
  timezone?: string;
  /** Minimum order amount in cents */
  minOrderAmountCents?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  /** Shop branding configuration. Set to null to clear branding. */
  branding?: ShopBranding;
};
export type DeleteResponse = {
  /** Whether deletion was successful */
  success?: boolean;
};
export type CategoryResponse = {
  /** Category ID */
  id?: string;
  /** Shop ID */
  shopId?: string;
  /** Category name */
  name?: string;
  /** Sort order for display */
  sortOrder?: number;
  /** Whether category is deleted */
  isDeleted?: boolean;
  /** Creation timestamp */
  createdAt?: string;
  /** Last update timestamp */
  updatedAt?: string;
};
export type CategoriesResponse = CategoryResponse[];
export type CreateCategoryRequest = {
  /** Category name */
  name: string;
  /** Sort order for display */
  sortOrder?: number;
};
export type UpdateCategoryRequest = {
  /** Category name */
  name?: string;
  /** Sort order for display */
  sortOrder?: number;
};
export type ProductResponse = {
  /** Product ID */
  id?: string;
  /** Shop ID */
  shopId?: string;
  /** Product name */
  name?: string;
  /** Product description */
  description?: string;
  /** Sort order for display */
  sortOrder?: number;
  /** Product price in cents */
  price?: number;
  /** Product categories with full details */
  categories?: {
    /** Category ID */
    id?: string;
    /** Category name */
    name?: string;
    /** Category sort order */
    sortOrder?: number;
  }[];
  /** Product images */
  images?: {
    /** Image ID */
    id?: string;
    /** Image URL */
    url?: string;
    /** Whether this is the primary image */
    isPrimary?: boolean;
  }[];
  /** Allergy information */
  allergyInfo?: string[];
  /** Product variant groups (optional) */
  variantGroups?: {
    /** Variant group ID */
    id?: string;
    /** Variant group name */
    name?: string;
    options?: {
      /** Option ID */
      id?: string;
      /** Option name */
      name?: string;
      /** Price difference in cents */
      priceDelta?: number;
      /** Whether option is available */
      isAvailable?: boolean;
    }[];
  }[];
  /** Product addon groups (optional) */
  addonGroups?: {
    /** Addon group ID */
    id?: string;
    /** Addon group name */
    name?: string;
    /** Minimum selectable options */
    minSelectable?: number;
    /** Maximum selectable options */
    maxSelectable?: number;
    options?: {
      /** Option ID */
      id?: string;
      /** Option name */
      name?: string;
      /** Price difference in cents */
      priceDelta?: number;
      /** Whether option is available */
      isAvailable?: boolean;
    }[];
  }[];
  /** Whether product is available */
  isAvailable?: boolean;
  /** Whether product is deleted */
  isDeleted?: boolean;
  /** Creation timestamp */
  createdAt?: string;
  /** Last update timestamp */
  updatedAt?: string;
};
export type ProductsResponse = ProductResponse[];
export type CreateProductRequest = {
  /** Shop ID that owns this product */
  shopId: string;
  /** Product name */
  name: string;
  /** Product description */
  description: string;
  /** Product price in cents */
  price: number;
  /** Sort order for display */
  sortOrder?: number;
  /** Category IDs */
  categoryIds?: string[];
  images?: {
    id?: string;
    url?: string;
    isPrimary?: boolean;
  }[];
  /** Allergy information */
  allergyInfo?: string[];
  /** Whether product is available */
  isAvailable?: boolean;
};
export type UpdateProductRequest = {
  /** Shop ID (required for partition key) */
  shopId?: string;
  /** Product name */
  name?: string;
  /** Product description */
  description?: string;
  /** Product price in cents */
  price?: number;
  /** Sort order for display */
  sortOrder?: number;
  /** Category IDs */
  categoryIds?: string[];
  images?: {
    id?: string;
    url?: string;
    isPrimary?: boolean;
  }[];
  /** Allergy information */
  allergyInfo?: string[];
  /** Whether product is available */
  isAvailable?: boolean;
};
export type GenerateImageUploadUrlResponse = {
  /** Unique identifier for the image */
  imageId: string;
  /** Pre-signed URL for uploading the image to Azure Blob Storage */
  uploadUrl: string;
  /** Permanent URL of the blob (without SAS token) */
  blobUrl: string;
  /** Expiration time of the upload URL */
  expiresAt: string;
};
export type GenerateImageUploadUrlRequest = {
  /** MIME type of the image to upload */
  contentType: "image/jpeg" | "image/png" | "image/webp";
  /** Optional filename for the image */
  fileName?: string;
  /** Optional maximum file size in bytes */
  maxSizeBytes?: number;
};
export type ProductImageResponse = {
  /** Image ID */
  id: string;
  /** Image URL */
  url: string;
  /** Alternative text for the image */
  alt?: string;
  /** Sort order for displaying images */
  sortOrder: number;
  /** Whether this is the primary product image */
  isPrimary: boolean;
};
export type AddProductImageRequest = {
  /** Image ID returned from the upload URL generation */
  imageId: string;
  /** Blob URL of the uploaded image */
  url: string;
  /** Alternative text for the image */
  alt?: string;
  /** Sort order for displaying images */
  sortOrder?: number;
};
export type CheckoutResponse = {
  /** Created order ID */
  orderId: string;
  /** Stripe PaymentIntent client secret. Pass this to stripe.confirmPayment() on the frontend. */
  clientSecret: string;
  /** Server-computed order total in cents */
  subtotalCents: number;
  /** ISO currency code from the shop */
  currency: string;
};
export type CheckoutItem = {
  /** Product ID */
  productId: string;
  /** Quantity to order */
  quantity: number;
  /** ID of the selected variant option (e.g. size) */
  selectedVariantOptionId?: string;
  /** IDs of selected addon options */
  selectedAddonOptionIds?: string[];
};
export type CheckoutRequest = {
  /** ID of the shop to order from */
  shopId: string;
  /** Items to order */
  items: CheckoutItem[];
  /** Customer email (optional) */
  customerEmail?: string;
  /** Customer name (optional) */
  customerName?: string;
};
export const {
  useGetShopsQuery,
  useCreateShopMutation,
  useGetShopBySlugQuery,
  useGetMyShopsQuery,
  useGetShopByIdQuery,
  useUpdateShopMutation,
  useDeleteShopMutation,
  useGetCategoriesByShopQuery,
  useCreateCategoryMutation,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsByShopQuery,
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGenerateUploadUrlMutation,
  useAddProductImageMutation,
  useCreateOrderMutation,
  useStripeWebhookMutation,
} = injectedRtkApi;
