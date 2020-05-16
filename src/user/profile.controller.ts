import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('profiles')
export class ProfileController {
  constructor(private userService: UserService) {}

  @Get('/:username')
  async findProfile(@Param('username') username: string) {
    const foundUser = await this.userService.findByUsername(username);
    if (!foundUser) throw new NotFoundException('User was not found');
    return foundUser;
  }
}
