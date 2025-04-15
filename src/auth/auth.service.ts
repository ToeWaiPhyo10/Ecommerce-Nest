import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { SignInDTO } from './dtos/signin-dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { formatResponse } from 'src/utils/response.util';
import { SignUpDTO } from './dtos/signup-dto';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Role } from './enum/role.enum';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signIn(signInDTO: SignInDTO) {
    const user = await this.userService.findByEmail(signInDTO.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatch = await bcrypt.compare(
      signInDTO.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.jwtService.signAsync({
      id: user.id,
      role: user.role,
    });
    return formatResponse(200, 'Login successful', { ...user, token });
  }
  async signUp(signUpDTO: SignUpDTO) {
    const { username, email, password } = signUpDTO;
    const userExist = await this.userRepository.findOne({
      where: [{ username: username }, { email: email }],
    });

    if (userExist) {
      throw new BadRequestException(
        `User with the same ${userExist.username === username ? 'username' : 'email'} already exist`,
      );
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await this.userRepository.create({
      ...signUpDTO,
      password: hashedPassword,
      role: Role.User,
    });
    const savedUser = await this.userRepository.save(newUser);
    return formatResponse(200, 'User successfully created', savedUser);
  }
}
