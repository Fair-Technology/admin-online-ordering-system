import { createContext, useContext } from 'react';

/** 'owner' | a custom role id | null (not a member) */
export type ShopRole = string | null;

export const ShopRoleContext = createContext<ShopRole>(null);

export function useShopRole(): ShopRole {
  return useContext(ShopRoleContext);
}
