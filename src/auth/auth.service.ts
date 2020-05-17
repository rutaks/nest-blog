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
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async register(credentials: RegisterDTO) {
    try {
      const newUser = this.userRepo.create(credentials);
      await newUser.save();
      const token = this.jwtService.sign({ username: newUser.username });
      return { user: { ...newUser.toJSON(), token } };
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
      if (!foundUser) throw new UnauthorizedException('Invalid Credentials');
      const isValid = await foundUser.comparePassword(password);
      if (!isValid) throw new UnauthorizedException('Invalid Credentials');
      const token = this.jwtService.sign({ username: foundUser.username });
      return { user: { ...foundUser.toJSON(), token } };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
