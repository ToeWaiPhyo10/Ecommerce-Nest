import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user-dto';
import { formatResponse } from 'src/utils/response.util';
import { Role } from 'src/auth/enum/role.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find();
    return formatResponse(200, '', users);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    return formatResponse(200, '', user);
  }

  async create(user: CreateUserDto) {
    const userExist = await this.userRepository.findOne({
      where: [{ username: user.username }, { email: user.email }],
    });

    if (userExist) {
      throw new BadRequestException(
        `User with the same ${userExist.username === user?.username ? 'username' : 'email'} already exist`,
      );
    }
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    const newUser = await this.userRepository.create({
      ...user,
      password: hashedPassword,
      role: user.role ?? Role.User,
    });
    const savedUser = await this.userRepository.save(newUser);
    return formatResponse(200, 'User successfully created', savedUser);
  }

  async delete(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException(`User not found`);
    }
    this.userRepository.delete(id);
    return formatResponse(200, 'User successfully deleted', {});
  }

  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }
}
