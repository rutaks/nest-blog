import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { RegisterDTO, LoginDTO } from 'src/dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async register(credentials: RegisterDTO) {
    try {
      const newUser = this.userRepo.create(credentials);
      await newUser.save();

      return newUser;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username has already been taken');
      }
      throw new InternalServerErrorException();
    }
  }

  async login({ email, password }: LoginDTO) {
    try {
      const foundUser = await this.userRepo.findOne({ where: { email } });
      if (foundUser && foundUser.comparePassword(password)) {
        return foundUser;
      }

      throw new UnauthorizedException('Invalid Credentials');
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
