import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class SignUpDTO {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  )
  @IsNotEmpty()
  password: string;
}
