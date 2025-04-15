import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async createRefreshToken(user: User): Promise<RefreshToken> {
    // Generate refresh token
    const token = uuidv4();
    
    // Calculate expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Save refresh token to database
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token,
      userId: user.id,
      username: user.username,
      role: user.role,
      expiryDate,
      user,
    });
    
    return await this.refreshTokenRepository.save(refreshTokenEntity);
  }

  async findRefreshToken(token: string): Promise<RefreshToken> {
    return await this.refreshTokenRepository.findOne({
      where: { token, isRevoked: false },
      relations: ['user'],
    });
  }

  async validateRefreshToken(token: string): Promise<RefreshToken> {
    const refreshToken = await this.findRefreshToken(token);
    
    if (!refreshToken) {
      throw new ForbiddenException('Invalid refresh token');
    }
    
    // Check if token is expired
    if (refreshToken.expiryDate < new Date()) {
      throw new ForbiddenException('Refresh token expired');
    }
    
    return refreshToken;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { isRevoked: true }
    );
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId },
      { isRevoked: true }
    );
  }

  generateAccessToken(user: User): string {
    return this.jwtService.sign({
      id: user.id,
      role: user.role,
    });
  }
}
