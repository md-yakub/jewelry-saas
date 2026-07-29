import { applyDecorators, HttpStatus, Type } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from "@nestjs/swagger";
import {
  ApiErrorResponseDto,
  ApiResponseDto,
  PaginatedResponseDto,
  PaginationMetaDto,
} from "../dto/api-response.dto";

const timestamp = "2026-07-19T10:00:00.000Z";

export function envelopeSchema(model: Type<unknown>, example?: unknown) {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiResponseDto) },
      {
        properties: {
          data: { $ref: getSchemaPath(model) },
          timestamp: { type: "string", example: timestamp },
        },
      },
    ],
    ...(example ? { example: { data: example, timestamp } } : {}),
  };
}

export function arrayEnvelopeSchema(model: Type<unknown>, example?: unknown[]) {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiResponseDto) },
      {
        properties: {
          data: {
            type: "array",
            items: { $ref: getSchemaPath(model) },
          },
          timestamp: { type: "string", example: timestamp },
        },
      },
    ],
    ...(example ? { example: { data: example, timestamp } } : {}),
  };
}

export function paginatedEnvelopeSchema(
  model: Type<unknown>,
  exampleItems: unknown[] = [],
) {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiResponseDto) },
      {
        properties: {
          data: {
            allOf: [
              { $ref: getSchemaPath(PaginatedResponseDto) },
              {
                properties: {
                  items: {
                    type: "array",
                    items: { $ref: getSchemaPath(model) },
                  },
                  pagination: { $ref: getSchemaPath(PaginationMetaDto) },
                },
              },
            ],
          },
          timestamp: { type: "string", example: timestamp },
        },
      },
    ],
    example: {
      data: {
        items: exampleItems,
        pagination: {
          page: 1,
          limit: 20,
          total: exampleItems.length,
          totalPages: 1,
        },
      },
      timestamp,
    },
  };
}

export function ApiEnvelopeOk(model: Type<unknown>, example?: unknown) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiOkResponse({ schema: envelopeSchema(model, example) }),
  );
}

export function ApiEnvelopeCreated(model: Type<unknown>, example?: unknown) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiCreatedResponse({ schema: envelopeSchema(model, example) }),
  );
}

export function ApiEnvelopeArrayOk(model: Type<unknown>, example?: unknown[]) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiOkResponse({ schema: arrayEnvelopeSchema(model, example) }),
  );
}

export function ApiPaginatedOk(model: Type<unknown>, exampleItems?: unknown[]) {
  return applyDecorators(
    ApiExtraModels(
      ApiResponseDto,
      PaginatedResponseDto,
      PaginationMetaDto,
      model,
    ),
    ApiOkResponse({ schema: paginatedEnvelopeSchema(model, exampleItems) }),
  );
}

export function ApiStandardErrors(
  options: {
    badRequest?: boolean;
    unauthorized?: boolean;
    forbidden?: boolean;
    notFound?: boolean;
    conflict?: boolean;
    internal?: boolean;
  } = {},
) {
  const decorators = [ApiExtraModels(ApiErrorResponseDto)];

  if (options.badRequest ?? true) {
    decorators.push(
      ApiBadRequestResponse({
        description: "Validation failed or the request cannot be processed.",
        schema: errorSchema(HttpStatus.BAD_REQUEST, "Bad Request", [
          "field must be valid",
        ]),
      }) as MethodDecorator & ClassDecorator,
    );
  }

  if (options.unauthorized ?? true) {
    decorators.push(
      ApiUnauthorizedResponse({
        description: "Missing, expired, or invalid access token.",
        schema: errorSchema(
          HttpStatus.UNAUTHORIZED,
          "Unauthorized",
          "Unauthorized",
        ),
      }) as MethodDecorator & ClassDecorator,
    );
  }

  if (options.forbidden) {
    decorators.push(
      ApiForbiddenResponse({
        description:
          "Authenticated user does not have access to this resource.",
        schema: errorSchema(
          HttpStatus.FORBIDDEN,
          "Forbidden",
          "Forbidden resource",
        ),
      }) as MethodDecorator & ClassDecorator,
    );
  }

  if (options.notFound) {
    decorators.push(
      ApiNotFoundResponse({
        description: "Requested resource was not found.",
        schema: errorSchema(
          HttpStatus.NOT_FOUND,
          "Not Found",
          "Resource not found",
        ),
      }) as MethodDecorator & ClassDecorator,
    );
  }

  if (options.conflict) {
    decorators.push(
      ApiConflictResponse({
        description: "Resource conflicts with existing data.",
        schema: errorSchema(
          HttpStatus.CONFLICT,
          "Conflict",
          "Resource already exists",
        ),
      }) as MethodDecorator & ClassDecorator,
    );
  }

  if (options.internal) {
    decorators.push(
      ApiInternalServerErrorResponse({
        description: "Unexpected server error.",
        schema: errorSchema(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Internal Server Error",
          "Internal server error",
        ),
      }) as MethodDecorator & ClassDecorator,
    );
  }

  return applyDecorators(...decorators);
}

function errorSchema(
  statusCode: number,
  error: string,
  message: string | string[],
) {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiErrorResponseDto) },
      {
        properties: {
          statusCode: { type: "number", example: statusCode },
          message: Array.isArray(message)
            ? { type: "array", items: { type: "string" }, example: message }
            : { type: "string", example: message },
          error: { type: "string", example: error },
          path: {
            type: "string",
            example: "/shops/shop_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3/items",
          },
          timestamp: { type: "string", example: timestamp },
        },
      },
    ],
  };
}
