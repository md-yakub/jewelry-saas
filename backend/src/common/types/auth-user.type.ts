import { RoleCode } from "@prisma/client";

export type AuthUser = {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  role?: RoleCode;
};
