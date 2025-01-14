import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDTO {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;
}
