import {
  Body,
  Controller,
  Get,
  Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterShopDto } from "./dto/register-shop.dto";
import {
  ApiAuthLogin,
  ApiAuthLogout,
  ApiAuthMe,
  ApiAuthRefresh,
  ApiAuthRegisterShop,
} from "./swagger/auth-docs.decorators";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register-shop")
  @ApiAuthRegisterShop()
  registerShop(@Body() dto: RegisterShopDto) {
    return this.authService.registerShop(dto);
  }

  @Post("login")
  @ApiAuthLogin()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  @ApiAuthRefresh()
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @Post("logout")
  @ApiAuthLogout()
  logout(@CurrentUser() user: AuthUser) {
    return this.authService.logout(user.userId);
  }

  @Get("me")
  @ApiAuthMe()
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.userId);
  }
}
