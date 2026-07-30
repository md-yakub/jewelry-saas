import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SuperAdminGuard } from "../common/guards/super-admin.guard";
import { SuperAdminController } from "./super-admin.controller";
import { SuperAdminService } from "./super-admin.service";

@Module({
  imports: [PrismaModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, SuperAdminGuard],
})
export class SuperAdminModule {}
