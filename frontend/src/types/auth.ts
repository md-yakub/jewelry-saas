export type RoleCode = "SUPER_ADMIN" | "SHOP_OWNER" | "MANAGER" | "STAFF";

export type ShopMembership = {
  shopId: string;
  role: RoleCode;
  shop: {
    name: string;
    slug: string;
  };
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isSuperAdmin: boolean;
  isActive?: boolean;
};
