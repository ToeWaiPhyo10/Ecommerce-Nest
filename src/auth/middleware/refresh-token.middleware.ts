import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = this.extractTokenFromHeader(req);

    // If no access token, proceed to next middleware (AuthGuard will handle this)
    if (!accessToken) {
      return next();
    }

    try {
      // Try to verify the access token
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_SECRET,
      });

      // Token is valid, set user in request
      req['user'] = payload;
      return next();
    } catch (error) {
      // If token is expired, try to use refresh token
      if (error.name === 'TokenExpiredError') {
        // Get refresh token from header or cookie
        const refreshToken =
          (req.headers['x-refresh-token'] as string) ||
          (req.cookies && req.cookies['refreshToken']);

        if (!refreshToken) {
          // No refresh token, proceed to next middleware (AuthGuard will handle this)
          return next();
        }

        try {
          try {
            // Validate the refresh token
            const storedRefreshToken =
              await this.refreshTokenService.validateRefreshToken(refreshToken);

            // Generate new access token
            const accessToken = this.jwtService.sign({
              id: storedRefreshToken.userId,
              role: storedRefreshToken.role,
            });

            // Create new refresh token
            const newRefreshToken =
              await this.refreshTokenService.createRefreshToken(
                storedRefreshToken.user,
              );

            // Revoke the old refresh token
            await this.refreshTokenService.revokeRefreshToken(refreshToken);

            // Set the new tokens in response headers
            res.setHeader('Authorization', `Bearer ${accessToken}`);
            res.setHeader('x-refresh-token', newRefreshToken.token);

            // Set the user in request
            req['user'] = {
              id: storedRefreshToken.userId,
              role: storedRefreshToken.role,
            };

            // Proceed to next middleware
            return next();
          } catch (error) {
            // Error validating refresh token, proceed to next middleware
            return next();
          }
        } catch (refreshError) {
          // Error handling refresh token, proceed to next middleware
          return next();
        }
      } else {
        // Other token error, proceed to next middleware
        return next();
      }
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
