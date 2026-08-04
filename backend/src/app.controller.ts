import { Controller, Get } from "@nestjs/common";
import { Public } from "./auth/decorators/public.decorator";
import { ApiTags } from "@nestjs/swagger";
import { ApiHealthCheck } from "./swagger/health-docs.decorators";

@Controller()
@ApiTags("Health")
export class AppController {
  @Public()
  @Get("health")
  @ApiHealthCheck()
  health() {
    return { status: "ok", service: "jewelry-saas-backend" };
  }
}
