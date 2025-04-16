import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { PasswordReset } from './password-reset.entity';
import { PasswordResetService } from './password-reset.service';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    UserModule,
    MailerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User, RefreshToken, PasswordReset]),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenService, PasswordResetService],
  exports: [AuthService, RefreshTokenService, PasswordResetService, TypeOrmModule],
})
export class AuthModule {}
