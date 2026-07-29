import { Controller, Get } from "@nestjs/common";
import { Public } from "./auth/decorators/public.decorator";
import { ApiEnvelopeOk } from "./common/swagger/api-response.decorators";
import { HealthResponseDto } from "./common/swagger/response-models.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller()
@ApiTags("Health")
export class AppController {
  @Public()
  @Get("health")
  @ApiOperation({
    summary: "Health check",
    description: "Returns a lightweight public health status for the backend.",
  })
  @ApiEnvelopeOk(HealthResponseDto, {
    status: "ok",
    service: "jewelry-saas-backend",
  })
  health() {
    return { status: "ok", service: "jewelry-saas-backend" };
  }
}
