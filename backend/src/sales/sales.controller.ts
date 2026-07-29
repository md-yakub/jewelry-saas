import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import {
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../common/swagger/api-response.decorators";
import {
  InvoiceResponseDto,
  RefundResponseDto,
  SaleCreatedResponseDto,
  SaleResponseDto,
  examples,
} from "../common/swagger/response-models.dto";
import { AuthUser } from "../common/types/auth-user.type";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { QuerySalesDto } from "./dto/query-sales.dto";
import { SalesService } from "./sales.service";

@Controller("shops/:shopId/sales")
@ApiTags("Sales")
@ApiBearerAuth("access-token")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Post()
  @ApiOperation({
    summary: "Create sale",
    description:
      "Creates a sale, marks inventory items as sold, records payments, links old-gold exchanges, generates an invoice, and writes an audit log.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiBody({
    type: CreateSaleDto,
    examples: {
      singleCardPayment: {
        summary: "Single card payment",
        value: {
          customerId: examples.customerId,
          items: [{ itemId: examples.itemId, price: 59850 }],
          paymentMethod: "CARD",
          discountAmount: 500,
          taxAmount: 1795.5,
        },
      },
      mixedPaymentWithOldGold: {
        summary: "Mixed payment with old gold",
        value: {
          customerId: examples.customerId,
          items: [{ itemId: examples.itemId, price: 59850 }],
          paymentMethod: "MIXED",
          payments: [
            { method: "CASH", amount: 31145.5 },
            { method: "CARD", amount: 30000, reference: "CARD-APPROVAL-7788" },
          ],
          oldGoldExchangeIds: ["ogx_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3"],
          discountAmount: 500,
          taxAmount: 1795.5,
        },
      },
    },
  })
  @ApiEnvelopeCreated(SaleCreatedResponseDto)
  @ApiStandardErrors({
    forbidden: true,
    notFound: true,
    conflict: true,
    internal: true,
  })
  create(
    @Param("shopId") shopId: string,
    @Body() dto: CreateSaleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.salesService.create(shopId, dto, user);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Get()
  @ApiOperation({
    summary: "List sales",
    description:
      "Returns paginated sales with customer, invoice, line item, and payment details.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "search", required: false, example: "INV-20260719" })
  @ApiQuery({ name: "from", required: false, example: "2026-07-01" })
  @ApiQuery({ name: "to", required: false, example: "2026-07-19" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["COMPLETED", "REFUNDED"],
    example: "COMPLETED",
  })
  @ApiQuery({
    name: "customerId",
    required: false,
    example: examples.customerId,
  })
  @ApiPaginatedOk(SaleResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  findAll(@Param("shopId") shopId: string, @Query() query: QuerySalesDto) {
    return this.salesService.findAll(shopId, query);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Get(":id")
  @ApiOperation({
    summary: "Get sale",
    description:
      "Returns a sale with customer, item, payment, and invoice details.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiParam({
    name: "id",
    description: "Sale identifier.",
    example: examples.saleId,
  })
  @ApiEnvelopeOk(SaleResponseDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  findOne(@Param("shopId") shopId: string, @Param("id") id: string) {
    return this.salesService.findOne(shopId, id);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Get(":id/invoice")
  @ApiOperation({
    summary: "Generate invoice",
    description:
      "Returns the invoice generated for a sale, including rendered HTML content.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiParam({
    name: "id",
    description: "Sale identifier.",
    example: examples.saleId,
  })
  @ApiEnvelopeOk(InvoiceResponseDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  getInvoice(@Param("shopId") shopId: string, @Param("id") id: string) {
    return this.salesService.getInvoice(shopId, id);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Post(":id/refund")
  @ApiOperation({
    summary: "Refund sale",
    description:
      "Marks a completed sale as refunded and makes sold inventory items available again.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiParam({
    name: "id",
    description: "Sale identifier.",
    example: examples.saleId,
  })
  @ApiEnvelopeOk(RefundResponseDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  refund(
    @Param("shopId") shopId: string,
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.salesService.refund(shopId, id, user);
  }
}
