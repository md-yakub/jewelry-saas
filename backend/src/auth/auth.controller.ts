import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiStandardErrors,
} from "../common/swagger/api-response.decorators";
import {
  AuthResponseDto,
  MessageResponseDto,
  TokenRefreshResponseDto,
  UserSummaryResponseDto,
} from "../common/swagger/response-models.dto";
import { AuthUser } from "../common/types/auth-user.type";
import { Public } from "./decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterShopDto } from "./dto/register-shop.dto";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register-shop")
  @ApiOperation({
    summary: "Register shop",
    description:
      "Creates a new jewelry shop, owner user, shop membership, and initial authentication tokens.",
  })
  @ApiBody({
    type: RegisterShopDto,
    examples: {
      royalGold: {
        summary: "Royal Gold Jewellers",
        value: {
          shopName: "Royal Gold Jewellers",
          shopEmail: "owner@royalgold.example",
          shopPhone: "+91 98765 43210",
          shopAddress: "12 MG Road, Bengaluru, Karnataka",
          ownerName: "Aarav Mehta",
          ownerEmail: "owner@royalgold.example",
          ownerPhone: "+91 98765 43210",
          password: "Str0ngPass!2026",
        },
      },
    },
  })
  @ApiEnvelopeCreated(AuthResponseDto)
  @ApiStandardErrors({ unauthorized: false, conflict: true, internal: true })
  registerShop(@Body() dto: RegisterShopDto) {
    return this.authService.registerShop(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  @ApiOperation({
    summary: "Login",
    description:
      "Authenticates a user and returns access and refresh tokens plus shop memberships.",
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      ownerLogin: {
        summary: "Owner login",
        value: {
          email: "owner@royalgold.example",
          password: "Str0ngPass!2026",
        },
      },
    },
  })
  @ApiEnvelopeOk(AuthResponseDto)
  @ApiStandardErrors({ unauthorized: true, internal: true })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  @ApiOperation({
    summary: "Refresh token",
    description: "Rotates a valid refresh token and returns a new token pair.",
  })
  @ApiEnvelopeOk(TokenRefreshResponseDto)
  @ApiStandardErrors({ unauthorized: true, internal: true })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("logout")
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Logout",
    description: "Clears the stored refresh token hash for the current user.",
  })
  @ApiEnvelopeOk(MessageResponseDto, { message: "Logged out successfully" })
  @ApiStandardErrors({ unauthorized: true, internal: true })
  logout(@CurrentUser() user: AuthUser) {
    return this.authService.logout(user.userId);
  }

  @Get("me")
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Current user",
    description: "Returns the authenticated user profile and shop memberships.",
  })
  @ApiEnvelopeOk(UserSummaryResponseDto)
  @ApiStandardErrors({ unauthorized: true, internal: true })
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.userId);
  }
}
