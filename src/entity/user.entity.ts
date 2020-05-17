import { AbstractEntity } from './abstract.entity';
import { Entity, Column, BeforeInsert, JoinTable, ManyToMany } from 'typeorm';
import { Exclude, classToPlain } from 'class-transformer';
import * as bcrypt from 'bcryptjs';

@Entity('users')
export class UserEntity extends AbstractEntity {
  @Column()
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: null, nullable: true })
  image: string | null;

  @Column()
  @Exclude()
  password: string;

  @ManyToMany(
    type => UserEntity,
    user => user.followee,
  )
  @JoinTable()
  followers: UserEntity[];

  @ManyToMany(
    type => UserEntity,
    user => user.followers,
  )
  @JoinTable()
  followee: UserEntity[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(passwordAttempt: string) {
    return await bcrypt.compare(passwordAttempt, this.password);
  }

  toJSON() {
    return classToPlain(this);
  }

  isFollowedBy(user: UserEntity) {
    let isFollowing = false;
    this.followers.forEach(follower => {
      if (follower.id === user.id) {
        isFollowing = true;
      }
    });
    return isFollowing;
  }
}
