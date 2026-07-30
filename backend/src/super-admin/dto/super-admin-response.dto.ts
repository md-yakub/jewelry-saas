import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SuperAdminOverviewDto {
  @ApiProperty({ description: "Total user accounts.", example: 12 })
  totalUsers!: number;

  @ApiProperty({ description: "Active user accounts.", example: 10 })
  activeUsers!: number;

  @ApiProperty({ description: "Inactive user accounts.", example: 2 })
  inactiveUsers!: number;

  @ApiProperty({ description: "Total shops.", example: 4 })
  totalShops!: number;

  @ApiProperty({ description: "Active shops.", example: 3 })
  activeShops!: number;

  @ApiProperty({ description: "Inactive shops.", example: 1 })
  inactiveShops!: number;

  @ApiProperty({ description: "Total shop memberships.", example: 14 })
  totalMemberships!: number;
}

export class SuperAdminUserDto {
  @ApiProperty({
    description: "User identifier.",
    example: "usr_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({ description: "User full name.", example: "Aarav Mehta" })
  name!: string;

  @ApiProperty({
    description: "User email.",
    example: "owner@royalgold.example",
  })
  email!: string;

  @ApiPropertyOptional({
    description: "User phone.",
    example: "+91 98765 43210",
  })
  phone?: string;

  @ApiProperty({
    description: "Whether user is a platform Super Admin.",
    example: false,
  })
  isSuperAdmin!: boolean;

  @ApiProperty({ description: "Whether user can sign in.", example: true })
  isActive!: boolean;

  @ApiProperty({
    description: "Creation timestamp.",
    example: "2026-07-30T10:00:00.000Z",
  })
  createdAt!: string;
}

export class SuperAdminShopOwnerDto {
  @ApiProperty({
    description: "Owner user identifier.",
    example: "usr_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({ description: "Owner name.", example: "Aarav Mehta" })
  name!: string;

  @ApiProperty({
    description: "Owner email.",
    example: "owner@royalgold.example",
  })
  email!: string;
}

export class SuperAdminShopDto {
  @ApiProperty({
    description: "Shop identifier.",
    example: "shop_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({ description: "Shop name.", example: "Royal Gold Jewellers" })
  name!: string;

  @ApiProperty({ description: "Shop slug.", example: "royal-gold-jewellers" })
  slug!: string;

  @ApiPropertyOptional({
    description: "Shop email.",
    example: "owner@royalgold.example",
  })
  email?: string;

  @ApiPropertyOptional({
    description: "Shop phone.",
    example: "+91 98765 43210",
  })
  phone?: string;

  @ApiProperty({ description: "Whether shop is active.", example: true })
  isActive!: boolean;

  @ApiProperty({
    description: "Creation timestamp.",
    example: "2026-07-30T10:00:00.000Z",
  })
  createdAt!: string;

  @ApiPropertyOptional({
    description: "Shop owner when available.",
    type: SuperAdminShopOwnerDto,
  })
  owner?: SuperAdminShopOwnerDto | null;
}
