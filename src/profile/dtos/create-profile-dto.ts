import {
  IsDateString,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateProfileDTO {
  @IsNotEmpty()
  gender: string;

  @IsNotEmpty()
  phoneNo: string;

  @IsOptional()
  profile: string;
}
