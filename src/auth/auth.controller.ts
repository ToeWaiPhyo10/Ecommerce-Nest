import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDTO } from './dtos/signin-dto';
import { SignUpDTO } from './dtos/signup-dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RefreshTokenService } from './refresh-token.service';
import { PasswordResetService } from './password-reset.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { VerifyResetTokenDto } from './dtos/verify-reset-token.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { CompleteResetPasswordDto } from './dtos/complete-reset-password.dto';
import { ResendTokenDto } from './dtos/resend-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private refreshTokenService: RefreshTokenService,
    private passwordResetService: PasswordResetService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDTO) {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registerDto: SignUpDTO) {
    return this.authService.signUp(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('revoke-tokens/:userId')
  async revokeAllTokens(@Param('userId') userId: string) {
    await this.refreshTokenService.revokeAllUserRefreshTokens(userId);
    return {
      statusCode: 200,
      message: 'All refresh tokens revoked successfully',
    };
  }
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Body('userId') userId: string,
    @Body('refreshToken') refreshToken?: string,
  ) {
    return this.authService.logout(userId, refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.passwordResetService.generateResetToken(
      forgotPasswordDto.email,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-otp')
  async resendResetToken(@Body() resendTokenDto: ResendTokenDto) {
    return this.passwordResetService.resendResetToken(resendTokenDto.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyResetToken(@Body() verifyResetTokenDto: VerifyResetTokenDto) {
    return this.passwordResetService.verifyResetToken(
      verifyResetTokenDto.email,
      verifyResetTokenDto.token,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.token,
      resetPasswordDto.password,
      resetPasswordDto.confirmPassword,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('complete-reset-password')
  async completeResetPassword(
    @Body() completeResetPasswordDto: CompleteResetPasswordDto,
  ) {
    return this.passwordResetService.completePasswordReset(
      completeResetPasswordDto.userId,
      completeResetPasswordDto.email,
      completeResetPasswordDto.password,
      completeResetPasswordDto.confirmPassword,
    );
  }
}
