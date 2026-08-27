import { applyDecorators } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { ApiEnvelopeOk } from "../common/swagger/api-response.decorators";
import { HealthResponseDto } from "../common/swagger/response-models.dto";

export const ApiHealthCheck = () =>
  applyDecorators(
    ApiOperation({
      summary: "Health check",
      description:
        "Returns a lightweight public health status for the backend.",
    }),
    ApiEnvelopeOk(HealthResponseDto, {
      status: "ok",
      service: "jewelry-saas-backend",
    }),
  );
