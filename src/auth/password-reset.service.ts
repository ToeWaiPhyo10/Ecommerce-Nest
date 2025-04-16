import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordReset } from './password-reset.entity';
import { User } from 'src/users/user.entity';
import { MailerService } from 'src/mailer/mailer.service';
import { UserService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { formatResponse } from 'src/utils/response.util';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailerService: MailerService,
    private userService: UserService,
  ) {}

  async generateResetToken(email: string) {
    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Generate a random 6-digit token
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry time to 1 hour from now
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    // Save token to database
    const passwordReset = this.passwordResetRepository.create({
      userId: user.id,
      email,
      token,
      expiryDate,
    });

    await this.passwordResetRepository.save(passwordReset);

    // Send email with reset token
    await this.sendPasswordResetEmail(email, token);

    return formatResponse(200, 'Password reset token has been sent to your email', null);
  }

  async verifyResetToken(email: string, token: string) {
    const passwordReset = await this.findValidToken(email, token);
    
    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Get user information to return (excluding sensitive data)
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return user info without sensitive data
    const { password, ...userInfo } = user;
    
    return formatResponse(200, 'Token verified successfully', { 
      userId: passwordReset.userId,
      email: passwordReset.email,
      username: userInfo.username
    });
  }

  async resetPassword(email: string, token: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const passwordReset = await this.findValidToken(email, token);
    
    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Update user's password
    const user = await this.userService.findByEmail(email);
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    await this.userRepository.update(user.id, {
      password: hashedPassword,
    });

    // Mark token as used
    await this.passwordResetRepository.update(passwordReset.id, {
      isUsed: true,
    });
    
    return formatResponse(200, 'Password has been reset successfully', null);
  }
  
  async completePasswordReset(userId: string, email: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    
    // Find the latest valid token for this user and email
    const latestToken = await this.passwordResetRepository.findOne({
      where: {
        userId,
        email,
        isUsed: false,
      },
      order: {
        expiryDate: 'DESC',
      },
    });
    
    if (!latestToken || latestToken.expiryDate < new Date()) {
      throw new BadRequestException('No valid password reset request found');
    }
    
    // Update user's password
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });
    
    // Mark token as used
    await this.passwordResetRepository.update(latestToken.id, {
      isUsed: true,
    });

    return formatResponse(200, 'Password has been reset successfully', null);
  }

  private async findValidToken(email: string, token: string): Promise<PasswordReset | null> {
    const passwordReset = await this.passwordResetRepository.findOne({
      where: {
        email,
        token,
        isUsed: false,
      },
    });

    if (!passwordReset) {
      return null;
    }

    // Check if token is expired
    if (passwordReset.expiryDate < new Date()) {
      return null;
    }

    return passwordReset;
  }

  async resendResetToken(email: string) {
    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Check if there's a recent token that's not expired
    const recentToken = await this.passwordResetRepository.findOne({
      where: {
        email,
        isUsed: false,
      },
      order: {
        expiryDate: 'DESC',
      },
    });

    // If there's a recent token and it was created less than 1 minute ago, prevent spam
    if (recentToken) {
      const now = new Date();
      const tokenCreationTime = new Date(recentToken.expiryDate);
      tokenCreationTime.setHours(tokenCreationTime.getHours() - 1); // Token expires in 1 hour, so creation time is 1 hour before expiry
      
      const timeDiffInSeconds = Math.floor((now.getTime() - tokenCreationTime.getTime()) / 1000);
      
      if (timeDiffInSeconds < 60) { // Less than 1 minute ago
        throw new BadRequestException(`Please wait ${60 - timeDiffInSeconds} seconds before requesting another token`);
      }

      // If the token exists but is older than 1 minute, invalidate it
      await this.passwordResetRepository.update(recentToken.id, {
        isUsed: true,
      });
    }

    // Generate a new token
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry time to 1 hour from now
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    // Save token to database
    const passwordReset = this.passwordResetRepository.create({
      userId: user.id,
      email,
      token,
      expiryDate,
    });

    await this.passwordResetRepository.save(passwordReset);

    // Send email with reset token
    await this.sendPasswordResetEmail(email, token);

    return formatResponse(200, 'A new password reset token has been sent to your email', null);
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const mailOptions = {
      to: email,
      subject: 'Password Reset',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Please use the following code to reset your password:</p>
        <h2 style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px;">${token}</h2>
        <p>This code will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    };

    return this.mailerService.sendMail(mailOptions);
  }
}
