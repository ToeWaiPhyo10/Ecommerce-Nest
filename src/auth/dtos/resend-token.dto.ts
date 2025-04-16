import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendTokenDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
