export interface ShopBrandingColors {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
}

export interface ShopBranding {
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  colors: ShopBrandingColors;
}

export interface ShopAddress {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface OpeningHoursSlot {
  open: string;
  close: string;
}

export interface OpeningHours {
  mon?: OpeningHoursSlot[];
  tue?: OpeningHoursSlot[];
  wed?: OpeningHoursSlot[];
  thu?: OpeningHoursSlot[];
  fri?: OpeningHoursSlot[];
  sat?: OpeningHoursSlot[];
  sun?: OpeningHoursSlot[];
}

export interface ShopMember {
  userId: string;
  role: 'owner' | 'staff';
  isActive: boolean;
}

export interface ShopClosure {
  id: string;
  start: string;
  end: string;
  reason?: string;
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  isDeleted: boolean;
  isPaused?: boolean;
  acceptingOrders?: boolean;
  allowGuestCheckout?: boolean;
  currency?: string;
  timezone?: string;
  minOrderAmountCents?: number;
  paymentPolicy?: 'pay_online';
  createdAt: string;
  updatedAt: string;
  branding?: ShopBranding | null;
}

export interface GetAllShopsResponse {
  shops: Shop[];
  total: number;
}

export interface CreateShopRequest {
  name: string;
  currency: string;
  timezone: string;
  minOrderAmountCents: number;
  paymentPolicy: 'pay_online';
  address: ShopAddress;
  pausedMessage?: string;
  orderAcceptanceMode?: 'auto';
  openingHours: OpeningHours;
  closures?: ShopClosure[];
  members?: ShopMember[];
  branding?: ShopBranding | null;
}

export interface UpdateShopRequest {
  name?: string;
  acceptingOrders?: boolean;
  isPaused?: boolean;
  pausedMessage?: string;
  paymentPolicy?: 'pay_online';
  allowGuestCheckout?: boolean;
  currency?: string;
  timezone?: string;
  minOrderAmountCents?: number;
  address?: Partial<ShopAddress>;
  branding?: ShopBranding | null;
}

export interface Category {
  id: string;
  shopId: string;
  name: string;
  sortOrder?: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CategoriesResponse = Category[];

export interface CreateCategoryRequest {
  name: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  sortOrder?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  sortOrder?: number;
}

export interface VariantOption {
  id: string;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
}

export interface VariantGroup {
  id: string;
  name: string;
  options: VariantOption[];
}

export interface AddonOption {
  id: string;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
}

export interface AddonGroup {
  id: string;
  name: string;
  minSelectable: number;
  maxSelectable: number;
  options: AddonOption[];
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  sortOrder?: number;
  price: number;
  categories: ProductCategory[];
  images: ProductImage[];
  allergyInfo?: string[];
  variantGroups?: VariantGroup[];
  addonGroups?: AddonGroup[];
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductsResponse = Product[];

export interface CreateProductRequest {
  shopId: string;
  name: string;
  description: string;
  price: number;
  sortOrder?: number;
  categoryIds?: string[];
  images?: Array<{ id: string; url: string; isPrimary: boolean }>;
  allergyInfo?: string[];
  isAvailable?: boolean;
}

export interface UpdateProductRequest {
  shopId?: string;
  name?: string;
  description?: string;
  price?: number;
  sortOrder?: number;
  categoryIds?: string[];
  images?: Array<{ id: string; url: string; isPrimary: boolean }>;
  allergyInfo?: string[];
  isAvailable?: boolean;
}

export interface DeleteResponse {
  success: boolean;
}

export interface GenerateImageUploadUrlRequest {
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  fileName?: string;
  maxSizeBytes?: number;
}

export interface GenerateImageUploadUrlResponse {
  imageId: string;
  uploadUrl: string;
  blobUrl: string;
  expiresAt: string;
}

export interface AddProductImageRequest {
  imageId: string;
  url: string;
  alt?: string;
  sortOrder?: number;
}

export interface ProductImageResponse {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ApiError {
  error: string;
}
