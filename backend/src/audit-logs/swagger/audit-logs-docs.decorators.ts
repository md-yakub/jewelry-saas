import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import {
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  AuditLogResponseDto,
  examples,
} from "../../common/swagger/response-models.dto";

export const ApiAuditLogsList = () =>
  applyDecorators(
    ApiOperation({
      summary: "List audit logs",
      description:
        "Returns paginated audit logs for a shop. Private old/new JSON metadata is intentionally not modeled in public examples.",
    }),
    ApiParam({
      name: "shopId",
      description: "Shop identifier.",
      example: examples.shopId,
    }),
    ApiQuery({ name: "page", required: false, example: 1 }),
    ApiQuery({ name: "limit", required: false, example: 20 }),
    ApiQuery({ name: "search", required: false, example: "inventory" }),
    ApiQuery({ name: "action", required: false, example: "inventory.create" }),
    ApiPaginatedOk(AuditLogResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );
