import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { Repository } from 'typeorm';
import { CreateProfileDTO } from './dtos/create-profile-dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProfileDTO: CreateProfileDTO & { userId: string }) {
    const user = await this.userRepository.findOne({
      where: { id: createProfileDTO.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createProfileDTO.userId} not found`,
      );
    }
    const profile = await this.profileRepository.create({
      ...createProfileDTO,
      user,
    });
    return this.profileRepository.save(profile);
  }
}
