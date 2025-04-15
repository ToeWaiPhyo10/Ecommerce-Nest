import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { SignInDTO } from './dtos/signin-dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { formatResponse } from 'src/utils/response.util';
import { SignUpDTO } from './dtos/signup-dto';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Role } from './enum/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async signIn(signInDTO: SignInDTO) {
    const user = await this.userService.findByEmail(signInDTO.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatch = await bcrypt.compare(
      signInDTO.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate access token
    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      role: user.role,
    });

    // Create refresh token
    const refreshTokenEntity =
      await this.refreshTokenService.createRefreshToken(user);
    const refreshToken = refreshTokenEntity.token;

    return formatResponse(200, 'Login successful', {
      ...user,
      accessToken,
      refreshToken,
    });
  }
  async signUp(signUpDTO: SignUpDTO) {
    const { username, email, password } = signUpDTO;
    const userExist = await this.userRepository.findOne({
      where: [{ username: username }, { email: email }],
    });

    if (userExist) {
      throw new BadRequestException(
        `User with the same ${userExist.username === username ? 'username' : 'email'} already exist`,
      );
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await this.userRepository.create({
      ...signUpDTO,
      password: hashedPassword,
      role: Role.User,
    });
    const savedUser = await this.userRepository.save(newUser);
    return formatResponse(200, 'User successfully created', savedUser);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      // Validate the refresh token
      const storedRefreshToken =
        await this.refreshTokenService.validateRefreshToken(refreshToken);

      // Generate new access token
      const accessToken = await this.jwtService.signAsync({
        id: storedRefreshToken.userId,
        role: storedRefreshToken.role,
      });

      // Create new refresh token
      const newRefreshTokenEntity =
        await this.refreshTokenService.createRefreshToken(
          storedRefreshToken.user,
        );

      // Revoke the old refresh token
      await this.refreshTokenService.revokeRefreshToken(refreshToken);

      return formatResponse(200, 'Token refreshed successfully', {
        accessToken,
        refreshToken: newRefreshTokenEntity.token,
      });
    } catch (error) {
      throw new ForbiddenException(error.message || 'Invalid refresh token');
    }
  }

  async revokeAllUserRefreshTokens(userId: string) {
    await this.refreshTokenService.revokeAllUserRefreshTokens(userId);
    return formatResponse(200, 'All refresh tokens revoked successfully', null);
  }
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // If a specific refresh token is provided, only revoke that one
      await this.refreshTokenService.revokeRefreshToken(refreshToken);
    } else {
      // Otherwise revoke all refresh tokens for the user
      await this.refreshTokenService.revokeAllUserRefreshTokens(userId);
    }

    return formatResponse(200, 'Logout successful', null);
  }
}
