import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dtos/create-category-dto';
import { UpdateCategoryDTO } from './dtos/update-category-dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async getAllCategory() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async getCategory(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Post()
  async createCategory(@Body() createDTO: CreateCategoryDTO) {
    return this.categoryService.create(createDTO);
  }

  @Patch(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDTO,
  ) {
    return this.categoryService.update(id, updateDto);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
