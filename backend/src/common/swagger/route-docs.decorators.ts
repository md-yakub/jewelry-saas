import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from '../../auth/dto/login.dto';
import { RegisterShopDto } from '../../auth/dto/register-shop.dto';
import { CreateSaleDto } from '../../sales/dto/create-sale.dto';
import {
  SuperAdminOverviewDto,
  SuperAdminShopDto,
  SuperAdminUserDto,
} from '../../super-admin/dto/super-admin-response.dto';
import {
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiPaginatedEnvelope,
} from './api-response.decorators';
import {
  AuditLogResponseDto,
  AuthResponseDto,
  CategoryResponseDto,
  CustomerResponseDto,
  GoldRateResponseDto,
  HealthResponseDto,
  InvoiceResponseDto,
  JewelryItemResponseDto,
  OldGoldExchangeResponseDto,
  PriceCalculationResponseDto,
  RefundResponseDto,
  SaleCreatedResponseDto,
  SaleResponseDto,
  SalesSummaryReportDto,
  TokenRefreshResponseDto,
  UserSummaryResponseDto,
  CraftsmanResponseDto,
  CustomOrderResponseDto,
  DailyClosingReportDto,
  GoldSoldReportDto,
  InventoryValueReportDto,
} from './response-models.dto';

type SwaggerDecorator = ClassDecorator | MethodDecorator;

const bearer = 'access-token';

const unauthorized = () =>
  ApiUnauthorizedResponse({
    description: 'Missing, expired, or invalid access token.',
  });

const forbidden = () =>
  ApiForbiddenResponse({
    description: 'Authenticated user does not have permission for this resource.',
  });

const badRequest = () =>
  ApiBadRequestResponse({
    description: 'Request validation failed.',
  });

const notFound = (description = 'Requested resource was not found.') =>
  ApiNotFoundResponse({ description });

const conflict = (description = 'Request conflicts with an existing resource.') =>
  ApiConflictResponse({ description });

const shopParam = () =>
  ApiParam({
    name: 'shopId',
    description: 'Shop identifier for the tenant-scoped request.',
    example: 'cm4shop0001royalgold',
  });

const paginationQueries = (includeSearch = true): SwaggerDecorator[] => {
  const decorators: SwaggerDecorator[] = [
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number for paginated results.',
      example: 1,
      type: Number,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Maximum number of records to return.',
      example: 20,
      type: Number,
    }),
  ];

  if (includeSearch) {
    decorators.push(
      ApiQuery({
        name: 'search',
        required: false,
        description: 'Case-insensitive search term.',
        example: 'Royal Gold',
      }),
    );
  }

  return decorators;
};

const dateRangeQueries = (): SwaggerDecorator[] => [
  ApiQuery({
    name: 'from',
    required: false,
    description: 'Inclusive start date in ISO 8601 format.',
    example: '2026-07-01',
  }),
  ApiQuery({
    name: 'to',
    required: false,
    description: 'Inclusive end date in ISO 8601 format.',
    example: '2026-07-31',
  }),
];

export const HealthDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Check API health',
      description: 'Returns the backend health status for monitoring and uptime checks.',
    }),
    ApiEnvelopeOk(HealthResponseDto, 'Backend health status.'),
  );

export const RegisterShopDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Register a shop owner and shop',
      description:
        'Creates a new owner account, shop, shop membership, and authentication tokens.',
    }),
    ApiBody({
      type: RegisterShopDto,
      examples: {
        royalGold: {
          summary: 'Royal Gold Jewellers',
          value: {
            ownerName: 'Aisha Khan',
            email: 'owner@royalgold.example',
            password: 'StrongPass123!',
            shopName: 'Royal Gold Jewellers',
            phone: '+91-9876543210',
            address: '12 MG Road, Bengaluru',
          },
        },
      },
    }),
    ApiEnvelopeCreated(AuthResponseDto, 'Shop registration completed.'),
    badRequest(),
    conflict('Email or shop details already exist.'),
  );

export const LoginDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Log in',
      description:
        'Authenticates a shop user or Super Admin and returns access and refresh tokens.',
    }),
    ApiBody({
      type: LoginDto,
      examples: {
        shopUser: {
          summary: 'Shop owner login',
          value: {
            email: 'owner@royalgold.example',
            password: 'StrongPass123!',
          },
        },
        superAdmin: {
          summary: 'Super Admin login',
          value: {
            email: 'admin@royalgold.example',
            password: 'ChangeMe123!',
          },
        },
      },
    }),
    ApiEnvelopeOk(AuthResponseDto, 'Login successful.'),
    badRequest(),
    unauthorized(),
  );

export const RefreshDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Refresh tokens',
      description: 'Issues a new access token and refresh token pair.',
    }),
    ApiEnvelopeOk(TokenRefreshResponseDto, 'Tokens refreshed.'),
    unauthorized(),
  );

export const LogoutDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Log out',
      description: 'Revokes the authenticated user refresh token.',
    }),
    ApiOkResponse({ description: 'Logout completed.' }),
    unauthorized(),
  );

export const CurrentUserDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get current user',
      description: 'Returns the authenticated user profile and shop memberships.',
    }),
    ApiEnvelopeOk(UserSummaryResponseDto, 'Current authenticated user.'),
    unauthorized(),
  );

export const CreateInventoryItemDocs = () =>
  applyDecorators(
    shopParam(),
    ApiOperation({
      summary: 'Create inventory item',
      description: 'Creates a jewelry inventory item for the selected shop.',
    }),
    ApiEnvelopeCreated(JewelryItemResponseDto, 'Inventory item created.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    conflict('SKU or barcode already exists in this shop.'),
  );

export const ListInventoryItemsDocs = () =>
  applyDecorators(
    shopParam(),
    ...paginationQueries(),
    ApiQuery({
      name: 'categoryId',
      required: false,
      description: 'Filter by jewelry category.',
      example: 'cm4cat0001rings',
    }),
    ApiQuery({
      name: 'isActive',
      required: false,
      description: 'Filter by active inventory state.',
      example: true,
      type: Boolean,
    }),
    ApiOperation({
      summary: 'List inventory items',
      description: 'Returns paginated jewelry items for a shop with optional filters.',
    }),
    ApiPaginatedEnvelope(JewelryItemResponseDto, 'Inventory items.'),
    unauthorized(),
    forbidden(),
  );

export const GetInventoryItemDocs = () =>
  applyDecorators(
    shopParam(),
    ApiParam({
      name: 'itemId',
      description: 'Inventory item identifier.',
      example: 'cm4item0001ring22k',
    }),
    ApiOperation({
      summary: 'Get inventory item',
      description: 'Returns one jewelry inventory item from the selected shop.',
    }),
    ApiEnvelopeOk(JewelryItemResponseDto, 'Inventory item.'),
    unauthorized(),
    forbidden(),
    notFound('Inventory item was not found.'),
  );

export const UpdateInventoryItemDocs = () =>
  applyDecorators(
    shopParam(),
    ApiParam({
      name: 'itemId',
      description: 'Inventory item identifier.',
      example: 'cm4item0001ring22k',
    }),
    ApiOperation({
      summary: 'Update inventory item',
      description: 'Updates jewelry item details without changing endpoint behavior.',
    }),
    ApiEnvelopeOk(JewelryItemResponseDto, 'Inventory item updated.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    notFound('Inventory item was not found.'),
    conflict('SKU or barcode already exists in this shop.'),
  );

export const DeleteInventoryItemDocs = () =>
  applyDecorators(
    shopParam(),
    ApiParam({
      name: 'itemId',
      description: 'Inventory item identifier.',
      example: 'cm4item0001ring22k',
    }),
    ApiOperation({
      summary: 'Deactivate inventory item',
      description: 'Marks an inventory item inactive for the selected shop.',
    }),
    ApiOkResponse({ description: 'Inventory item deactivated.' }),
    unauthorized(),
    forbidden(),
    notFound('Inventory item was not found.'),
  );

export const CreateCategoryDocs = () =>
  applyDecorators(
    shopParam(),
    ApiOperation({
      summary: 'Create inventory category',
      description: 'Creates a jewelry category such as rings, chains, or bangles.',
    }),
    ApiEnvelopeCreated(CategoryResponseDto, 'Category created.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    conflict('Category name already exists in this shop.'),
  );

export const ListCategoriesDocs = () =>
  applyDecorators(
    shopParam(),
    ApiOperation({
      summary: 'List inventory categories',
      description: 'Returns categories configured for the selected shop.',
    }),
    ApiEnvelopeOk(CategoryResponseDto, 'Inventory categories.', true),
    unauthorized(),
    forbidden(),
  );

export const CreateCustomerDocs = () =>
  applyDecorators(
    shopParam(),
    ApiOperation({
      summary: 'Create customer',
      description: 'Creates a customer record for the selected shop.',
    }),
    ApiEnvelopeCreated(CustomerResponseDto, 'Customer created.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    conflict('Customer phone or email already exists in this shop.'),
  );

export const ListCustomersDocs = () =>
  applyDecorators(
    shopParam(),
    ...paginationQueries(),
    ApiOperation({
      summary: 'List customers',
      description: 'Returns paginated customer records for the selected shop.',
    }),
    ApiPaginatedEnvelope(CustomerResponseDto, 'Customers.'),
    unauthorized(),
    forbidden(),
  );

export const GetCustomerDocs = () =>
  applyDecorators(
    shopParam(),
    ApiParam({
      name: 'customerId',
      description: 'Customer identifier.',
      example: 'cm4cust0001',
    }),
    ApiOperation({
      summary: 'Get customer',
      description: 'Returns one customer record for the selected shop.',
    }),
    ApiEnvelopeOk(CustomerResponseDto, 'Customer.'),
    unauthorized(),
    forbidden(),
    notFound('Customer was not found.'),
  );

export const UpdateCustomerDocs = () =>
  applyDecorators(
    shopParam(),
    ApiParam({
      name: 'customerId',
      description: 'Customer identifier.',
      example: 'cm4cust0001',
    }),
    ApiOperation({
      summary: 'Update customer',
      description: 'Updates customer profile details for the selected shop.',
    }),
    ApiEnvelopeOk(CustomerResponseDto, 'Customer updated.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    notFound('Customer was not found.'),
    conflict('Customer phone or email already exists in this shop.'),
  );

export const DeleteCustomerDocs = () =>
  applyDecorators(
    shopParam(),
    ApiParam({
      name: 'customerId',
      description: 'Customer identifier.',
      example: 'cm4cust0001',
    }),
    ApiOperation({
      summary: 'Delete customer',
      description: 'Deletes or deactivates a customer according to existing service behavior.',
    }),
    ApiOkResponse({ description: 'Customer deleted.' }),
    unauthorized(),
    forbidden(),
    notFound('Customer was not found.'),
  );

export const CreateGoldRateDocs = () =>
  applyDecorators(
    shopParam(),
    ApiOperation({
      summary: 'Create gold rate',
      description: 'Stores the current market rate for a carat value in the selected shop.',
    }),
    ApiEnvelopeCreated(GoldRateResponseDto, 'Gold rate created.'),
    badRequest(),
    unauthorized(),
    forbidden(),
  );

export const CurrentGoldRateDocs = () =>
  applyDecorators(
    shopParam(),
    ApiQuery({
      name: 'carat',
      required: false,
      description: 'Gold purity to fetch the current rate for.',
      example: 22,
      enum: [18, 21, 22, 24],
    }),
    ApiOperation({
      summary: 'Get current gold rate',
      description: 'Returns the latest gold rate for the selected shop and carat.',
    }),
    ApiEnvelopeOk(GoldRateResponseDto, 'Current gold rate.'),
    unauthorized(),
    forbidden(),
    notFound('Gold rate was not found.'),
  );

export const GoldRateHistoryDocs = () =>
  applyDecorators(
    shopParam(),
    ...dateRangeQueries(),
    ApiQuery({
      name: 'carat',
      required: false,
      description: 'Gold purity filter.',
      example: 22,
      enum: [18, 21, 22, 24],
    }),
    ApiOperation({
      summary: 'List gold rate history',
      description: 'Returns historical gold rates for the selected shop.',
    }),
    ApiEnvelopeOk(GoldRateResponseDto, 'Gold rate history.', true),
    unauthorized(),
    forbidden(),
  );

export const CalculatePriceDocs = () =>
  applyDecorators(
    shopParam(),
    ApiOperation({
      summary: 'Calculate jewelry price',
      description:
        'Calculates pricing from weight, purity, wastage, making charges, tax, and discounts.',
    }),
    ApiEnvelopeOk(PriceCalculationResponseDto, 'Calculated jewelry price.'),
    badRequest(),
    unauthorized(),
    forbidden(),
  );

export const CreateSaleDocs = () =>
  applyDecorators(
    shopParam(),
    ApiOperation({
      summary: 'Create sale',
      description: 'Creates a sale with line items, totals, and payment information.',
    }),
    ApiBody({
      type: CreateSaleDto,
      examples: {
        ringSale: {
          summary: '22K ring sale',
          value: {
            customerId: 'cm4cust0001',
            items: [
              {
                itemId: 'cm4item0001ring22k',
                quantity: 1,
                unitPrice: '62500.00',
                discount: '500.00',
              },
            ],
            paymentMethod: 'CASH',
            paidAmount: '62000.00',
            notes: 'Wedding ring purchase',
          },
        },
      },
    }),
    ApiEnvelopeCreated(SaleCreatedResponseDto, 'Sale created.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    notFound('Customer or inventory item was not found.'),
  );

export const ListSalesDocs = () =>
  applyDecorators(
    shopParam(),
    ...paginationQueries(false),
    ...dateRangeQueries(),
    ApiQuery({
      name: 'status',
      required: false,
      description: 'Sale status filter.',
      example: 'COMPLETED',
    }),
    ApiOperation({
      summary: 'List sales',
      description: 'Returns paginated sales for the selected shop.',
    }),
    ApiPaginatedEnvelope(SaleResponseDto, 'Sales.'),
    unauthorized(),
    forbidden(),
  );

export const GetSaleDocs = () =>
  applyDecorators(
    shopParam(),
    ApiParam({
      name: 'saleId',
      description: 'Sale identifier.',
      example: 'cm4sale0001',
    }),
    ApiOperation({
      summary: 'Get sale',
      description: 'Returns sale details, items, customer, and payment information.',
    }),
    ApiEnvelopeOk(SaleResponseDto, 'Sale.'),
    unauthorized(),
    forbidden(),
    notFound('Sale was not found.'),
  );

export const GetInvoiceDocs = () =>
  applyDecorators(
    shopParam(),
    ApiParam({
      name: 'saleId',
      description: 'Sale identifier.',
      example: 'cm4sale0001',
    }),
    ApiOperation({
      summary: 'Generate invoice',
      description: 'Returns invoice details for an existing sale.',
    }),
    ApiEnvelopeOk(InvoiceResponseDto, 'Invoice generated.'),
    unauthorized(),
    forbidden(),
    notFound('Sale was not found.'),
  );

export const RefundSaleDocs = () =>
  applyDecorators(
    shopParam(),
    ApiParam({
      name: 'saleId',
      description: 'Sale identifier.',
      example: 'cm4sale0001',
    }),
    ApiOperation({
      summary: 'Refund sale',
      description: 'Records a full or partial refund for a completed sale.',
    }),
    ApiEnvelopeOk(RefundResponseDto, 'Sale refunded.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    notFound('Sale was not found.'),
  );

export const CreateOldGoldExchangeDocs = () =>
  applyDecorators(
    shopParam(),
    ApiOperation({
      summary: 'Create old gold exchange',
      description: 'Records customer-provided old gold exchanged against a purchase.',
    }),
    ApiEnvelopeCreated(OldGoldExchangeResponseDto, 'Old gold exchange created.'),
    badRequest(),
    unauthorized(),
    forbidden(),
  );

export const ListOldGoldExchangesDocs = () =>
  applyDecorators(
    shopParam(),
    ...paginationQueries(false),
    ...dateRangeQueries(),
    ApiOperation({
      summary: 'List old gold exchanges',
      description: 'Returns old gold exchange records for the selected shop.',
    }),
    ApiPaginatedEnvelope(OldGoldExchangeResponseDto, 'Old gold exchanges.'),
    unauthorized(),
    forbidden(),
  );

export const CreateCustomOrderDocs = () =>
  applyDecorators(
    shopParam(),
    ApiOperation({
      summary: 'Create custom order',
      description: 'Creates a custom jewelry order request for a customer.',
    }),
    ApiEnvelopeCreated(CustomOrderResponseDto, 'Custom order created.'),
    badRequest(),
    unauthorized(),
    forbidden(),
  );

export const ListCustomOrdersDocs = () =>
  applyDecorators(
    shopParam(),
    ...paginationQueries(false),
    ApiQuery({
      name: 'status',
      required: false,
      description: 'Custom order status filter.',
      example: 'IN_PROGRESS',
    }),
    ApiOperation({
      summary: 'List custom orders',
      description: 'Returns custom jewelry orders for the selected shop.',
    }),
    ApiPaginatedEnvelope(CustomOrderResponseDto, 'Custom orders.'),
    unauthorized(),
    forbidden(),
  );

export const UpdateCustomOrderStatusDocs = () =>
  applyDecorators(
    shopParam(),
    ApiParam({
      name: 'orderId',
      description: 'Custom order identifier.',
      example: 'cm4order0001',
    }),
    ApiOperation({
      summary: 'Update custom order status',
      description: 'Changes the workflow status of a custom jewelry order.',
    }),
    ApiEnvelopeOk(CustomOrderResponseDto, 'Custom order status updated.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    notFound('Custom order was not found.'),
  );

export const AssignCraftsmanDocs = () =>
  applyDecorators(
    shopParam(),
    ApiParam({
      name: 'orderId',
      description: 'Custom order identifier.',
      example: 'cm4order0001',
    }),
    ApiOperation({
      summary: 'Assign craftsman',
      description: 'Assigns a craftsman to a custom jewelry order.',
    }),
    ApiEnvelopeOk(CustomOrderResponseDto, 'Craftsman assigned.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    notFound('Custom order or craftsman was not found.'),
  );

export const CreateCraftsmanDocs = () =>
  applyDecorators(
    shopParam(),
    ApiOperation({
      summary: 'Create craftsman',
      description: 'Creates a craftsman profile for custom jewelry work.',
    }),
    ApiEnvelopeCreated(CraftsmanResponseDto, 'Craftsman created.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    conflict('Craftsman contact details already exist in this shop.'),
  );

export const ListCraftsmenDocs = () =>
  applyDecorators(
    shopParam(),
    ...paginationQueries(),
    ApiOperation({
      summary: 'List craftsmen',
      description: 'Returns craftsmen available to the selected shop.',
    }),
    ApiPaginatedEnvelope(CraftsmanResponseDto, 'Craftsmen.'),
    unauthorized(),
    forbidden(),
  );

export const DailyClosingReportDocs = () =>
  applyDecorators(
    shopParam(),
    ApiQuery({
      name: 'date',
      required: false,
      description: 'Business date for the closing report.',
      example: '2026-07-19',
    }),
    ApiOperation({
      summary: 'Get daily closing report',
      description: 'Summarizes sales, payments, refunds, and closing totals for a date.',
    }),
    ApiEnvelopeOk(DailyClosingReportDto, 'Daily closing report.'),
    unauthorized(),
    forbidden(),
  );

export const SalesSummaryReportDocs = () =>
  applyDecorators(
    shopParam(),
    ...dateRangeQueries(),
    ApiOperation({
      summary: 'Get sales summary report',
      description: 'Summarizes sales totals and payment activity for a date range.',
    }),
    ApiEnvelopeOk(SalesSummaryReportDto, 'Sales summary report.'),
    unauthorized(),
    forbidden(),
  );

export const InventoryValueReportDocs = () =>
  applyDecorators(
    shopParam(),
    ApiOperation({
      summary: 'Get inventory value report',
      description: 'Summarizes inventory weight, quantity, and valuation.',
    }),
    ApiEnvelopeOk(InventoryValueReportDto, 'Inventory value report.'),
    unauthorized(),
    forbidden(),
  );

export const GoldSoldReportDocs = () =>
  applyDecorators(
    shopParam(),
    ...dateRangeQueries(),
    ApiOperation({
      summary: 'Get gold sold report',
      description: 'Summarizes sold gold weight and value by purity.',
    }),
    ApiEnvelopeOk(GoldSoldReportDto, 'Gold sold report.'),
    unauthorized(),
    forbidden(),
  );

export const ListAuditLogsDocs = () =>
  applyDecorators(
    shopParam(),
    ...paginationQueries(false),
    ...dateRangeQueries(),
    ApiQuery({
      name: 'action',
      required: false,
      description: 'Audit action filter.',
      example: 'SALE_CREATED',
    }),
    ApiQuery({
      name: 'entityType',
      required: false,
      description: 'Entity type filter.',
      example: 'Sale',
    }),
    ApiOperation({
      summary: 'List audit logs',
      description: 'Returns audit events for the selected shop without private metadata.',
    }),
    ApiPaginatedEnvelope(AuditLogResponseDto, 'Audit logs.'),
    unauthorized(),
    forbidden(),
  );

export const SuperAdminOverviewDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get Super Admin overview',
      description: 'Returns platform-level user, shop, and membership counts.',
    }),
    ApiEnvelopeOk(SuperAdminOverviewDto, 'Super Admin overview.'),
    unauthorized(),
    forbidden(),
  );

export const SuperAdminUsersDocs = () =>
  applyDecorators(
    ...paginationQueries(),
    ApiQuery({
      name: 'isActive',
      required: false,
      description: 'Filter users by active state.',
      example: true,
      type: Boolean,
    }),
    ApiOperation({
      summary: 'List platform users',
      description: 'Returns platform users without password or refresh token hashes.',
    }),
    ApiPaginatedEnvelope(SuperAdminUserDto, 'Platform users.'),
    unauthorized(),
    forbidden(),
  );

export const SuperAdminShopsDocs = () =>
  applyDecorators(
    ...paginationQueries(),
    ApiQuery({
      name: 'isActive',
      required: false,
      description: 'Filter shops by active state.',
      example: true,
      type: Boolean,
    }),
    ApiOperation({
      summary: 'List platform shops',
      description: 'Returns platform shops and owner summaries.',
    }),
    ApiPaginatedEnvelope(SuperAdminShopDto, 'Platform shops.'),
    unauthorized(),
    forbidden(),
  );

export const UpdateSuperAdminUserStatusDocs = () =>
  applyDecorators(
    ApiParam({
      name: 'id',
      description: 'User identifier.',
      example: 'cm4user0001',
    }),
    ApiOperation({
      summary: 'Update user status',
      description: 'Activates or deactivates a platform user.',
    }),
    ApiEnvelopeOk(SuperAdminUserDto, 'User status updated.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    notFound('User was not found.'),
  );

export const UpdateSuperAdminShopStatusDocs = () =>
  applyDecorators(
    ApiParam({
      name: 'id',
      description: 'Shop identifier.',
      example: 'cm4shop0001royalgold',
    }),
    ApiOperation({
      summary: 'Update shop status',
      description: 'Activates or deactivates a platform shop.',
    }),
    ApiEnvelopeOk(SuperAdminShopDto, 'Shop status updated.'),
    badRequest(),
    unauthorized(),
    forbidden(),
    notFound('Shop was not found.'),
  );
