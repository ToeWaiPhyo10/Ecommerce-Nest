import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyResetTokenDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
