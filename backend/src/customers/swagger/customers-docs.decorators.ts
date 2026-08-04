import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import {
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  CustomerResponseDto,
  MessageResponseDto,
  examples,
} from "../../common/swagger/response-models.dto";
import { CreateCustomerDto } from "../dto/create-customer.dto";

const shopParam = () =>
  ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  });

const customerParam = () =>
  ApiParam({
    name: "id",
    description: "Customer identifier.",
    example: examples.customerId,
  });

export const ApiCustomersCreate = () =>
  applyDecorators(
    ApiOperation({
      summary: "Create customer",
      description:
        "Creates a customer profile for purchases, old-gold exchanges, and custom orders.",
    }),
    shopParam(),
    ApiBody({
      type: CreateCustomerDto,
      examples: {
        retailCustomer: {
          summary: "Retail customer",
          value: {
            name: "Priya Shah",
            phone: "+91 99887 76655",
            email: "priya.shah@example.com",
            address: "5 Residency Road, Bengaluru",
            birthday: "1990-05-12",
            anniversary: "2016-11-20",
            notes: "Prefers 22K temple jewellery designs.",
          },
        },
      },
    }),
    ApiEnvelopeCreated(CustomerResponseDto),
    ApiStandardErrors({ forbidden: true, conflict: true, internal: true }),
  );

export const ApiCustomersList = () =>
  applyDecorators(
    ApiOperation({
      summary: "List customers",
      description:
        "Returns a paginated customer list with optional search by name, phone, or email.",
    }),
    shopParam(),
    ApiQuery({ name: "page", required: false, example: 1 }),
    ApiQuery({ name: "limit", required: false, example: 20 }),
    ApiQuery({ name: "search", required: false, example: "Priya" }),
    ApiPaginatedOk(CustomerResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiCustomersGet = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get customer",
      description: "Returns a customer profile and recent sales activity.",
    }),
    shopParam(),
    customerParam(),
    ApiEnvelopeOk(CustomerResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiCustomersUpdate = () =>
  applyDecorators(
    ApiOperation({
      summary: "Update customer",
      description: "Updates customer contact details and personal dates.",
    }),
    shopParam(),
    customerParam(),
    ApiEnvelopeOk(CustomerResponseDto),
    ApiStandardErrors({
      forbidden: true,
      notFound: true,
      conflict: true,
      internal: true,
    }),
  );

export const ApiCustomersRemove = () =>
  applyDecorators(
    ApiOperation({
      summary: "Delete customer",
      description:
        "Deletes a customer when no dependent sales, exchanges, or custom orders exist.",
    }),
    shopParam(),
    customerParam(),
    ApiEnvelopeOk(MessageResponseDto, {
      message: "Customer deleted successfully",
    }),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );
