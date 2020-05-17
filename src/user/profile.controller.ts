import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/auth/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from 'src/entity/user.entity';

@Controller('profiles')
export class ProfileController {
  constructor(private userService: UserService) {}

  @Get('/:username')
  async findProfile(@Param('username') username: string) {
    const foundUser = await this.userService.findByUsername(username);
    if (!foundUser) throw new NotFoundException('User was not found');
    return { profile: foundUser };
  }

  @Post('/:username/follow')
  @UseGuards(AuthGuard())
  followUser(@User() user: UserEntity, @Param('username') username: string) {
    return this.userService.followUser(user, username);
  }

  @Post('/:username/un-follow')
  @UseGuards(AuthGuard())
  unFollowUser(@User() user: UserEntity, @Param('username') username: string) {
    return this.userService.unFollowUser(user, username);
  }
}
