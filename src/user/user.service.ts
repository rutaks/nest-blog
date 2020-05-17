import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDTO } from 'src/dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async findByUsername(username: string): Promise<UserEntity> {
    return this.userRepo.findOne({ where: { username } });
  }

  async updateUser(username: string, data: UpdateUserDTO) {
    this.userRepo.update({ username }, data);
    return this.findByUsername(username);
  }

  async followUser(currentUser: UserEntity, username: string) {
    const foundUser = await this.userRepo.findOne({
      where: { username },
      relations: ['followers'],
    });
    if (foundUser.isFollowedBy(currentUser)) {
      throw new BadRequestException('Already Following User');
    }
    foundUser.followers.push(currentUser);
    await foundUser.save();
    return { foundUser, isFollowing: true };
  }

  async unFollowUser(currentUser: UserEntity, username: string) {
    const foundUser = await this.userRepo.findOne({
      where: { username },
      relations: ['followers'],
    });

    if (!foundUser.isFollowedBy(currentUser)) {
      throw new BadRequestException('Not Following User');
    }
    foundUser.followers = foundUser.followers.filter(
      follower => follower.id !== currentUser.id,
    );
    await foundUser.save();
    return { foundUser, isFollowing: false };
  }
}
