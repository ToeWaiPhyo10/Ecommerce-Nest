import { IsOptional } from 'class-validator';

export class UpdateCategoryDTO {
  @IsOptional()
  name: string;

  @IsOptional()
  description: string;
}
