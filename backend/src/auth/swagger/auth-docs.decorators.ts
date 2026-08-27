import { applyDecorators, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation } from "@nestjs/swagger";
import {
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  AuthResponseDto,
  MessageResponseDto,
  TokenRefreshResponseDto,
  UserSummaryResponseDto,
} from "../../common/swagger/response-models.dto";
import { Public } from "../decorators/public.decorator";
import { LoginDto } from "../dto/login.dto";
import { RegisterShopDto } from "../dto/register-shop.dto";

export const ApiAuthRegisterShop = () =>
  applyDecorators(
    Public(),
    ApiOperation({
      summary: "Register shop",
      description:
        "Creates a new jewelry shop, owner user, shop membership, and initial authentication tokens.",
    }),
    ApiBody({
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
    }),
    ApiEnvelopeCreated(AuthResponseDto),
    ApiStandardErrors({ unauthorized: false, conflict: true, internal: true }),
  );

export const ApiAuthLogin = () =>
  applyDecorators(
    Public(),
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: "Login",
      description:
        "Authenticates a user and returns access and refresh tokens plus shop memberships.",
    }),
    ApiBody({
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
    }),
    ApiEnvelopeOk(AuthResponseDto),
    ApiStandardErrors({ unauthorized: true, internal: true }),
  );

export const ApiAuthRefresh = () =>
  applyDecorators(
    Public(),
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: "Refresh token",
      description:
        "Rotates a valid refresh token and returns a new token pair.",
    }),
    ApiEnvelopeOk(TokenRefreshResponseDto),
    ApiStandardErrors({ unauthorized: true, internal: true }),
  );

export const ApiAuthLogout = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth("access-token"),
    ApiOperation({
      summary: "Logout",
      description: "Clears the stored refresh token hash for the current user.",
    }),
    ApiEnvelopeOk(MessageResponseDto, { message: "Logged out successfully" }),
    ApiStandardErrors({ unauthorized: true, internal: true }),
  );

export const ApiAuthMe = () =>
  applyDecorators(
    ApiBearerAuth("access-token"),
    ApiOperation({
      summary: "Current user",
      description:
        "Returns the authenticated user profile and shop memberships.",
    }),
    ApiEnvelopeOk(UserSummaryResponseDto),
    ApiStandardErrors({ unauthorized: true, internal: true }),
  );
