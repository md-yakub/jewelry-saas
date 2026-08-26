import { applyDecorators } from "@nestjs/common";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
} from "@nestjs/swagger";
import {
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  InvoiceResponseDto,
  InvoicePdfStatusResponseDto,
  RefundResponseDto,
  SaleCreatedResponseDto,
  SaleResponseDto,
  examples,
} from "../../common/swagger/response-models.dto";
import { CreateSaleDto } from "../dto/create-sale.dto";

const shopParam = () =>
  ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  });

const saleParam = () =>
  ApiParam({
    name: "id",
    description: "Sale identifier.",
    example: examples.saleId,
  });

export const ApiSalesCreate = () =>
  applyDecorators(
    ApiOperation({
      summary: "Create sale",
      description:
        "Creates a sale, marks inventory items as sold, records payments, links old-gold exchanges, generates an invoice, and writes an audit log.",
    }),
    shopParam(),
    ApiBody({
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
    }),
    ApiEnvelopeCreated(SaleCreatedResponseDto),
    ApiStandardErrors({
      forbidden: true,
      notFound: true,
      conflict: true,
      internal: true,
    }),
  );

export const ApiSalesList = () =>
  applyDecorators(
    ApiOperation({
      summary: "List sales",
      description:
        "Returns paginated sales with customer, invoice, line item, and payment details.",
    }),
    shopParam(),
    ApiQuery({ name: "page", required: false, example: 1 }),
    ApiQuery({ name: "limit", required: false, example: 20 }),
    ApiQuery({ name: "search", required: false, example: "INV-20260719" }),
    ApiQuery({ name: "from", required: false, example: "2026-07-01" }),
    ApiQuery({ name: "to", required: false, example: "2026-07-19" }),
    ApiQuery({
      name: "status",
      required: false,
      enum: ["COMPLETED", "REFUNDED"],
      example: "COMPLETED",
    }),
    ApiQuery({
      name: "customerId",
      required: false,
      example: examples.customerId,
    }),
    ApiPaginatedOk(SaleResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiSalesGet = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get sale",
      description:
        "Returns a sale with customer, item, payment, and invoice details.",
    }),
    shopParam(),
    saleParam(),
    ApiEnvelopeOk(SaleResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiSalesInvoice = () =>
  applyDecorators(
    ApiOperation({
      summary: "Generate invoice",
      description:
        "Returns the invoice generated for a sale, including rendered HTML content.",
    }),
    shopParam(),
    saleParam(),
    ApiEnvelopeOk(InvoiceResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiSalesInvoicePdfStatus = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get invoice PDF status",
      description: "Returns background PDF generation state for a sale invoice.",
    }),
    shopParam(),
    saleParam(),
    ApiEnvelopeOk(InvoicePdfStatusResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiSalesInvoicePdfDownload = () =>
  applyDecorators(
    ApiOperation({
      summary: "Download invoice PDF",
      description: "Downloads the generated PDF when its state is READY.",
    }),
    shopParam(),
    saleParam(),
    ApiProduces("application/pdf"),
    ApiOkResponse({
      description: "Generated invoice PDF.",
      schema: { type: "string", format: "binary" },
    }),
    ApiStandardErrors({ forbidden: true, notFound: true, conflict: true }),
  );

export const ApiSalesRefund = () =>
  applyDecorators(
    ApiOperation({
      summary: "Refund sale",
      description:
        "Marks a completed sale as refunded and makes sold inventory items available again.",
    }),
    shopParam(),
    saleParam(),
    ApiEnvelopeOk(RefundResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );
