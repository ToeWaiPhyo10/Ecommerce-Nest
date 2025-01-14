import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { Not, Repository } from 'typeorm';
import { formatResponse } from 'src/utils/response.util';
import { CreateCategoryDTO } from './dtos/create-category-dto';
import { UpdateCategoryDTO } from './dtos/update-category-dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async findAll() {
    const category = await this.categoryRepository.find();
    return formatResponse(200, '', category);
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOneBy({ id });
    return formatResponse(200, '', category);
  }
  async create(createDTO: CreateCategoryDTO) {
    const category = await this.categoryRepository.findOneBy({
      name: createDTO.name,
    });

    if (category) {
      throw new BadRequestException(
        `Category with the same name already exist`,
      );
    }

    const newCategory = await this.categoryRepository.create(createDTO);
    const savedCategory = await this.categoryRepository.save(newCategory);
    return formatResponse(201, 'Category successfully created', savedCategory);
  }

  async update(id: string, updateDTO: UpdateCategoryDTO) {
    const category = await this.categoryRepository.findOneBy({
      id,
    });
    if (!category) {
      throw new BadRequestException(`Category not found`);
    }
    const existCategory = await this.categoryRepository.findOne({
      where: {
        name: updateDTO.name,
        id: Not(id),
      },
    });

    if (existCategory) {
      throw new BadRequestException(
        `Category with the name "${updateDTO.name}" already exists`,
      );
    }
    const updatedCategory = await this.categoryRepository.merge(
      category,
      updateDTO,
    );
    const savedCategory = await this.categoryRepository.save(updatedCategory);
    return formatResponse(200, 'Category successfully updated', savedCategory);
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new BadRequestException(`Category not found`);
    }
    this.categoryRepository.delete(id);
    return formatResponse(200, 'Category successfully deleted', {});
  }
}
