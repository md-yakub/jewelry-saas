import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleCode } from "@prisma/client";
import { IS_PUBLIC_KEY } from "../../auth/decorators/public.decorator";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ShopAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { userId: string; isSuperAdmin: boolean };

    const shopId = request.params?.shopId as string | undefined;
    if (!shopId) {
      return true;
    }

    if (user?.isSuperAdmin) {
      request.memberRole = RoleCode.SUPER_ADMIN;
      return true;
    }

    const membership = await this.prisma.shopMember.findUnique({
      where: {
        shopId_userId: {
          shopId,
          userId: user.userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("You do not have access to this shop");
    }

    request.memberRole = membership.role;
    return true;
  }
}
