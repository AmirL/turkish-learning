import bcrypt from '@node-rs/bcrypt';
import type { User } from '@prisma/client';
import invariant from 'ts-invariant';

import { UserRepository } from './database/user.repository.server';
export type { User } from '@prisma/client';

export class UserService {
  static async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  static async createUser(email: string, password: string, name: string, avatar: string): Promise<User> {
    const hashedPassword = await this.hashPassword(password);
    // check if at least one user exists in db
    const usersCount = await UserRepository.count();
    const isFirstUser = usersCount === 0;

    const user = await UserRepository.create({
      email,
      name,
      avatar,
      password: hashedPassword,
      isEditor: isFirstUser ? true : false,
      isAdmin: isFirstUser ? true : false,
    });

    return user;
  }

  static async verifyLogin(email: string, password: string): Promise<User> {
    const user = await UserRepository.findByEmail(email);

    invariant(user, 'User not found');

    const isValid = await bcrypt.verify(password, user.password);
    invariant(isValid, 'Invalid password');

    return user;
  }
}
