import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import {
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  SuperAdminOverviewDto,
  SuperAdminShopDto,
  SuperAdminUserDto,
} from "../dto/super-admin-response.dto";

export const ApiSuperAdminOverview = () =>
  applyDecorators(
    ApiOperation({
      summary: "Super Admin overview",
      description: "Returns platform-wide user, shop, and membership counts.",
    }),
    ApiEnvelopeOk(SuperAdminOverviewDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiSuperAdminUsers = () =>
  applyDecorators(
    ApiOperation({
      summary: "List platform users",
      description:
        "Returns paginated users without password or refresh-token hashes.",
    }),
    ApiQuery({ name: "page", required: false, example: 1 }),
    ApiQuery({ name: "limit", required: false, example: 20 }),
    ApiQuery({ name: "search", required: false, example: "owner" }),
    ApiQuery({ name: "isActive", required: false, example: true }),
    ApiQuery({ name: "isSuperAdmin", required: false, example: false }),
    ApiPaginatedOk(SuperAdminUserDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiSuperAdminShops = () =>
  applyDecorators(
    ApiOperation({
      summary: "List platform shops",
      description: "Returns paginated shops with owner summary when available.",
    }),
    ApiQuery({ name: "page", required: false, example: 1 }),
    ApiQuery({ name: "limit", required: false, example: 20 }),
    ApiQuery({ name: "search", required: false, example: "Royal Gold" }),
    ApiQuery({ name: "isActive", required: false, example: true }),
    ApiPaginatedOk(SuperAdminShopDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiSuperAdminUpdateUserStatus = () =>
  applyDecorators(
    ApiOperation({
      summary: "Update user status",
      description: "Activates or deactivates a platform user.",
    }),
    ApiParam({ name: "id", description: "User identifier." }),
    ApiEnvelopeOk(SuperAdminUserDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiSuperAdminUpdateShopStatus = () =>
  applyDecorators(
    ApiOperation({
      summary: "Update shop status",
      description: "Activates or deactivates a shop.",
    }),
    ApiParam({ name: "id", description: "Shop identifier." }),
    ApiEnvelopeOk(SuperAdminShopDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );
