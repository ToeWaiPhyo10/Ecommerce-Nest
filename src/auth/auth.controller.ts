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

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private refreshTokenService: RefreshTokenService,
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
}
