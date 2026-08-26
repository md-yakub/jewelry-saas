import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  Carat,
  CustomOrderStatus,
  ItemStatus,
  InvoicePdfStatus,
  PaymentMethod,
  RoleCode,
  SaleStatus,
} from "@prisma/client";

export class MessageResponseDto {
  @ApiProperty({
    description: "Operation result message.",
    example: "Logged out successfully",
  })
  message!: string;
}

export class HealthResponseDto {
  @ApiProperty({ description: "Health status.", example: "ok" })
  status!: string;

  @ApiProperty({
    description: "Service name.",
    example: "jewelry-saas-backend",
  })
  service!: string;
}

export class ShopResponseDto {
  @ApiProperty({
    description: "Shop identifier.",
    example: "shop_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({
    description: "Registered shop name.",
    example: "Royal Gold Jewellers",
  })
  name!: string;

  @ApiProperty({
    description: "URL-friendly shop slug.",
    example: "royal-gold-jewellers",
  })
  slug!: string;

  @ApiPropertyOptional({
    description: "Shop email address.",
    example: "owner@royalgold.example",
  })
  email?: string;

  @ApiPropertyOptional({
    description: "Shop phone number.",
    example: "+91 98765 43210",
  })
  phone?: string;

  @ApiPropertyOptional({
    description: "Shop address.",
    example: "12 MG Road, Bengaluru, Karnataka",
  })
  address?: string;

  @ApiProperty({
    description: "ISO 4217 currency code used by the shop.",
    example: "USD",
  })
  currencyCode!: string;

  @ApiProperty({
    description: "Locale used for currency formatting.",
    example: "en-US",
  })
  locale!: string;
}

export class UserSummaryResponseDto {
  @ApiProperty({
    description: "User identifier.",
    example: "usr_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({ description: "User full name.", example: "Aarav Mehta" })
  name!: string;

  @ApiProperty({
    description: "User email address.",
    example: "owner@royalgold.example",
  })
  email!: string;

  @ApiPropertyOptional({
    description: "User phone number.",
    example: "+91 98765 43210",
  })
  phone?: string;

  @ApiProperty({
    description: "Whether the user has platform super-admin access.",
    example: false,
  })
  isSuperAdmin!: boolean;

  @ApiPropertyOptional({
    description: "User creation timestamp.",
    example: "2026-07-19T09:15:00.000Z",
  })
  createdAt?: string;

  @ApiPropertyOptional({
    description: "Shop memberships for the user.",
    type: () => [MembershipResponseDto],
  })
  memberships?: MembershipResponseDto[];
}

export class MembershipResponseDto {
  @ApiProperty({
    description: "Shop identifier.",
    example: "shop_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  shopId!: string;

  @ApiProperty({
    description: "Role assigned in the shop.",
    enum: RoleCode,
    example: RoleCode.SHOP_OWNER,
  })
  role!: RoleCode;

  @ApiProperty({ description: "Shop summary.", type: ShopResponseDto })
  shop!: ShopResponseDto;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "Authentication result message.",
    example: "Login successful",
  })
  message!: string;

  @ApiProperty({
    description: "Authenticated user.",
    type: UserSummaryResponseDto,
  })
  user!: UserSummaryResponseDto;

  @ApiPropertyOptional({
    description: "Registered shop for shop signup.",
    type: ShopResponseDto,
  })
  shop?: ShopResponseDto;

  @ApiPropertyOptional({
    description: "Shop memberships for the user.",
    type: [MembershipResponseDto],
  })
  memberships?: MembershipResponseDto[];

  @ApiProperty({
    description: "JWT access token.",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.payload",
  })
  accessToken!: string;

  @ApiProperty({
    description: "JWT refresh token. Store securely on the client.",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.payload",
  })
  refreshToken!: string;
}

export class TokenRefreshResponseDto {
  @ApiProperty({
    description: "Refresh result message.",
    example: "Token refreshed successfully",
  })
  message!: string;

  @ApiProperty({
    description: "New JWT access token.",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.access",
  })
  accessToken!: string;

  @ApiProperty({
    description: "New JWT refresh token.",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.refresh",
  })
  refreshToken!: string;
}

export class CategoryResponseDto {
  @ApiProperty({
    description: "Category identifier.",
    example: "cat_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({ description: "Category name.", example: "Rings" })
  name!: string;

  @ApiPropertyOptional({
    description: "Category description.",
    example: "Gold rings and engagement designs.",
  })
  description?: string;
}

export class JewelryItemResponseDto {
  @ApiProperty({
    description: "Inventory item identifier.",
    example: "item_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({
    description: "Item display name.",
    example: "22K Gold Ring with Ruby Stone",
  })
  name!: string;

  @ApiProperty({ description: "Stock keeping unit.", example: "RING-22K-0001" })
  sku!: string;

  @ApiProperty({ description: "Barcode value.", example: "8901234567890" })
  barcode!: string;

  @ApiProperty({ description: "Gold weight in grams.", example: 8.75 })
  goldWeight!: number;

  @ApiProperty({ description: "Stone weight in grams.", example: 0.35 })
  stoneWeight!: number;

  @ApiProperty({ description: "Net gold weight in grams.", example: 8.4 })
  netGoldWeight!: number;

  @ApiProperty({ description: "Gold purity.", enum: Carat, example: Carat.K22 })
  carat!: Carat;

  @ApiProperty({ description: "Making charge amount.", example: 3200 })
  makingCharge!: number;

  @ApiProperty({ description: "Wastage percentage.", example: 3.5 })
  wastagePercentage!: number;

  @ApiProperty({ description: "Stone price amount.", example: 1500 })
  stonePrice!: number;

  @ApiProperty({
    description: "Current inventory status.",
    enum: ItemStatus,
    example: ItemStatus.AVAILABLE,
  })
  status!: ItemStatus;

  @ApiProperty({ description: "Estimated selling price.", example: 59850 })
  sellingPriceEstimate!: number;

  @ApiPropertyOptional({
    description: "Assigned category.",
    type: CategoryResponseDto,
  })
  category?: CategoryResponseDto;
}

export class GoldRateResponseDto {
  @ApiProperty({
    description: "Gold rate identifier.",
    example: "rate_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({ description: "18K rate per gram.", example: 5430.5 })
  rate18K!: number;

  @ApiProperty({ description: "21K rate per gram.", example: 6335.25 })
  rate21K!: number;

  @ApiProperty({ description: "22K rate per gram.", example: 6637.75 })
  rate22K!: number;

  @ApiProperty({ description: "24K rate per gram.", example: 7240 })
  rate24K!: number;

  @ApiProperty({
    description: "Rate effective timestamp.",
    example: "2026-07-19T09:00:00.000Z",
  })
  effectiveDate!: string;
}

export class PriceCalculationResponseDto {
  @ApiProperty({ description: "Input used for the calculation." })
  input!: Record<string, unknown>;

  @ApiProperty({
    description: "Calculated price breakdown.",
    example: {
      currentGoldRate: 6637.75,
      goldValue: 58080.31,
      wastageValue: 2032.81,
      subtotal: 64813.12,
      tax: 1944.39,
      discount: 500,
      finalPrice: 66257.51,
    },
  })
  breakdown!: Record<string, number>;
}

export class CustomerResponseDto {
  @ApiProperty({
    description: "Customer identifier.",
    example: "cust_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({ description: "Customer name.", example: "Priya Shah" })
  name!: string;

  @ApiProperty({
    description: "Customer phone number.",
    example: "+91 99887 76655",
  })
  phone!: string;

  @ApiPropertyOptional({
    description: "Customer email.",
    example: "priya.shah@example.com",
  })
  email?: string;

  @ApiPropertyOptional({
    description: "Customer address.",
    example: "5 Residency Road, Bengaluru",
  })
  address?: string;
}

export class PaymentResponseDto {
  @ApiProperty({
    description: "Payment identifier.",
    example: "pay_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({
    description: "Payment method.",
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  method!: PaymentMethod;

  @ApiProperty({ description: "Payment amount.", example: 66257.51 })
  amount!: number;

  @ApiPropertyOptional({
    description: "External payment reference.",
    example: "CARD-APPROVAL-7788",
  })
  reference?: string;
}

export class SaleItemResponseDto {
  @ApiProperty({
    description: "Sale line item identifier.",
    example: "sale_item_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({
    description: "Inventory item identifier.",
    example: "item_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  itemId!: string;

  @ApiProperty({
    description: "Item name captured at sale time.",
    example: "22K Gold Ring with Ruby Stone",
  })
  itemNameSnapshot!: string;

  @ApiProperty({
    description: "SKU captured at sale time.",
    example: "RING-22K-0001",
  })
  skuSnapshot!: string;

  @ApiProperty({ description: "Line price.", example: 59850 })
  price!: number;
}

export class InvoiceResponseDto {
  @ApiProperty({
    description: "Invoice identifier.",
    example: "inv_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({
    description: "Invoice number.",
    example: "INV-20260719-00001",
  })
  invoiceNumber!: string;

  @ApiProperty({ description: "Sale currency snapshot.", example: "USD" })
  currencyCode!: string;

  @ApiProperty({
    description: "Rendered invoice HTML.",
    example: "<html><body><h2>Invoice INV-20260719-00001</h2></body></html>",
  })
  htmlContent!: string;

  @ApiProperty({
    description: "Background PDF generation state.",
    enum: InvoicePdfStatus,
    example: InvoicePdfStatus.PENDING,
  })
  pdfStatus!: InvoicePdfStatus;

  @ApiPropertyOptional({
    description: "Timestamp when PDF generation completed.",
    example: "2026-08-26T10:00:00.000Z",
  })
  pdfGeneratedAt?: string;

  @ApiProperty({
    description: "Issue timestamp.",
    example: "2026-07-19T10:00:00.000Z",
  })
  issuedAt!: string;
}

export class InvoicePdfStatusResponseDto {
  @ApiProperty({ description: "Invoice identifier." })
  id!: string;

  @ApiProperty({ description: "Sale identifier." })
  saleId!: string;

  @ApiProperty({ description: "Invoice number." })
  invoiceNumber!: string;

  @ApiProperty({ enum: InvoicePdfStatus })
  pdfStatus!: InvoicePdfStatus;

  @ApiPropertyOptional({ description: "PDF generation completion timestamp." })
  pdfGeneratedAt?: string;
}

export class SaleResponseDto {
  @ApiProperty({
    description: "Sale identifier.",
    example: "sale_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({
    description: "Sale status.",
    enum: SaleStatus,
    example: SaleStatus.COMPLETED,
  })
  status!: SaleStatus;

  @ApiProperty({
    description: "Subtotal before tax and discount.",
    example: 59850,
  })
  subtotal!: number;

  @ApiProperty({ description: "Tax amount.", example: 1795.5 })
  taxAmount!: number;

  @ApiProperty({ description: "Discount amount.", example: 500 })
  discountAmount!: number;

  @ApiProperty({ description: "Old gold deduction applied.", example: 0 })
  oldGoldDeduction!: number;

  @ApiProperty({ description: "Sale currency snapshot.", example: "USD" })
  currencyCode!: string;

  @ApiProperty({ description: "Final payable amount.", example: 61145.5 })
  totalAmount!: number;

  @ApiPropertyOptional({
    description: "Customer summary.",
    type: CustomerResponseDto,
  })
  customer?: CustomerResponseDto;

  @ApiPropertyOptional({
    description: "Sale line items.",
    type: [SaleItemResponseDto],
  })
  items?: SaleItemResponseDto[];

  @ApiPropertyOptional({
    description: "Payments recorded for the sale.",
    type: [PaymentResponseDto],
  })
  payments?: PaymentResponseDto[];

  @ApiPropertyOptional({
    description: "Invoice generated for the sale.",
    type: InvoiceResponseDto,
  })
  invoice?: InvoiceResponseDto;
}

export class SaleCreatedResponseDto {
  @ApiProperty({ description: "Created sale.", type: SaleResponseDto })
  sale!: SaleResponseDto;

  @ApiProperty({ description: "Generated invoice.", type: InvoiceResponseDto })
  invoice!: InvoiceResponseDto;
}

export class RefundResponseDto {
  @ApiProperty({
    description: "Refund result message.",
    example: "Sale refunded successfully",
  })
  message!: string;

  @ApiProperty({ description: "Refunded sale.", type: SaleResponseDto })
  sale!: SaleResponseDto;
}

export class OldGoldExchangeResponseDto {
  @ApiProperty({
    description: "Old gold exchange identifier.",
    example: "ogx_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({ description: "Gross gold weight in grams.", example: 12.5 })
  grossWeight!: number;

  @ApiProperty({
    description: "Purity carat.",
    enum: Carat,
    example: Carat.K22,
  })
  purityCarat!: Carat;

  @ApiProperty({ description: "Deduction percentage.", example: 4 })
  deductionPercentage!: number;

  @ApiProperty({ description: "Final payable weight in grams.", example: 12 })
  finalWeight!: number;

  @ApiProperty({ description: "Calculated exchange value.", example: 79653 })
  calculatedValue!: number;

  @ApiProperty({ description: "Customer summary.", type: CustomerResponseDto })
  customer!: CustomerResponseDto;
}

export class CraftsmanResponseDto {
  @ApiProperty({
    description: "Craftsman identifier.",
    example: "craft_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({ description: "Craftsman name.", example: "Vikram Soni" })
  name!: string;

  @ApiPropertyOptional({
    description: "Craftsman phone number.",
    example: "+91 91234 56780",
  })
  phone?: string;

  @ApiPropertyOptional({
    description: "Craft specialty.",
    example: "Temple jewellery engraving",
  })
  specialty?: string;

  @ApiProperty({
    description: "Whether the craftsman is active.",
    example: true,
  })
  isActive!: boolean;
}

export class CustomOrderResponseDto {
  @ApiProperty({
    description: "Custom order identifier.",
    example: "corder_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({
    description: "Order status.",
    enum: CustomOrderStatus,
    example: CustomOrderStatus.PENDING,
  })
  status!: CustomOrderStatus;

  @ApiProperty({
    description: "Design notes.",
    example: "22K bridal necklace with ruby centerpiece and filigree work.",
  })
  designNotes!: string;

  @ApiProperty({
    description: "Estimated gold weight in grams.",
    example: 42.75,
  })
  estimatedWeight!: number;

  @ApiProperty({ description: "Advance amount paid.", example: 25000 })
  advancePayment!: number;

  @ApiProperty({
    description: "Expected delivery date.",
    example: "2026-08-15T00:00:00.000Z",
  })
  deliveryDate!: string;

  @ApiProperty({ description: "Customer summary.", type: CustomerResponseDto })
  customer!: CustomerResponseDto;

  @ApiPropertyOptional({
    description: "Assigned craftsman.",
    type: CraftsmanResponseDto,
  })
  craftsman?: CraftsmanResponseDto;
}

export class DailyClosingReportResponseDto {
  @ApiProperty({ description: "Report date.", example: "2026-07-19" })
  date!: string;

  @ApiProperty({ description: "Completed sales total.", example: 245500.75 })
  totalSales!: number;

  @ApiProperty({ description: "Cash payments total.", example: 85000 })
  cashTotal!: number;

  @ApiProperty({ description: "Card payments total.", example: 100500.75 })
  cardTotal!: number;

  @ApiProperty({ description: "Bank transfer payments total.", example: 60000 })
  bankTotal!: number;

  @ApiProperty({ description: "Gold weight sold in grams.", example: 36.25 })
  totalGoldWeightSold!: number;

  @ApiProperty({ description: "Invoice count.", example: 6 })
  totalInvoices!: number;

  @ApiProperty({ description: "Old gold exchange total.", example: 45000 })
  oldGoldExchangeTotal!: number;

  @ApiProperty({ description: "Estimated profit.", example: 38500.75 })
  profitEstimate!: number;
}

export class SalesSummaryReportResponseDto {
  @ApiProperty({ description: "Start date.", example: "2026-07-01" })
  from!: string;

  @ApiProperty({ description: "End date.", example: "2026-07-19" })
  to!: string;

  @ApiProperty({ description: "Invoice count.", example: 48 })
  totalInvoices!: number;

  @ApiProperty({ description: "Sales amount.", example: 1845500.75 })
  totalSalesAmount!: number;

  @ApiProperty({ description: "Total discounts.", example: 18500 })
  totalDiscount!: number;

  @ApiProperty({ description: "Total tax.", example: 55365.02 })
  totalTax!: number;

  @ApiProperty({
    description: "Payment totals by method.",
    example: { cash: 650000, card: 720500.75, bankTransfer: 475000, mixed: 0 },
  })
  paymentBreakdown!: Record<string, number>;
}

export class InventoryValueReportResponseDto {
  @ApiProperty({
    description: "Number of available or reserved stock items.",
    example: 128,
  })
  stockCount!: number;

  @ApiProperty({
    description: "Total purchase-cost value.",
    example: 5825000.5,
  })
  purchaseCostValue!: number;

  @ApiProperty({ description: "Estimated selling value.", example: 6742500.75 })
  sellingEstimateValue!: number;

  @ApiProperty({
    description: "Total gold weight in stock.",
    example: 1540.375,
  })
  totalGoldWeight!: number;

  @ApiProperty({ description: "Estimated gross margin.", example: 917500.25 })
  estimatedGrossMargin!: number;
}

export class GoldSoldReportResponseDto {
  @ApiProperty({ description: "Start date.", example: "2026-07-01" })
  from!: string;

  @ApiProperty({ description: "End date.", example: "2026-07-19" })
  to!: string;

  @ApiProperty({ description: "Total gold sold in grams.", example: 212.875 })
  totalGoldSoldWeight!: number;
}

export class AuditLogResponseDto {
  @ApiProperty({
    description: "Audit log identifier.",
    example: "audit_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  id!: string;

  @ApiProperty({ description: "Audit action.", example: "inventory.create" })
  action!: string;

  @ApiProperty({ description: "Entity type affected.", example: "JewelryItem" })
  entityType!: string;

  @ApiPropertyOptional({
    description: "Entity identifier affected.",
    example: "item_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  entityId?: string;

  @ApiPropertyOptional({
    description: "User summary.",
    type: UserSummaryResponseDto,
  })
  user?: UserSummaryResponseDto;

  @ApiProperty({
    description: "Creation timestamp.",
    example: "2026-07-19T10:00:00.000Z",
  })
  createdAt!: string;
}

export const examples = {
  shopId: "shop_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  itemId: "item_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  customerId: "cust_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  saleId: "sale_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  craftsmanId: "craft_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
};
