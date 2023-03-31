import bcrypt from '@node-rs/bcrypt';
import type { User } from '@prisma/client';
import { redirect } from '@remix-run/node';
import invariant from 'ts-invariant';
import { authenticator } from '~/utils/auth.server';
import { db } from '~/utils/db.server';
export type { User } from '@prisma/client';

export class UserService {
  static async getUserById(id: number) {
    return db.user.findUnique({ where: { id } });
  }

  static async getUserByEmail(email: string) {
    return db.user.findUnique({ where: { email } });
  }

  static async changeUserAvatar(user_id: number, avatar: string) {
    return await db.user.update({
      where: { id: user_id },
      data: {
        avatar,
      },
    });
  }

  static async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  static async createUser(email: string, password: string, name: string, avatar: string): Promise<User> {
    const hashedPassword = await this.hashPassword(password);
    // check if at least one user exists in db
    const users = await db.user.findMany({ take: 1 });
    const isFirstUser = users.length === 0;

    const user = await db.user.create({
      data: {
        email,
        name,
        avatar,
        password: hashedPassword,
        isEditor: isFirstUser ? true : false,
        isAdmin: isFirstUser ? true : false,
      },
    });

    return user;
  }

  static async updateUserLearningMode(user_id: number, learningMode: number) {
    await db.user.update({
      where: { id: user_id },
      data: {
        learningMode,
      },
    });
  }

  static async verifyLogin(email: string, password: string): Promise<User> {
    const user = await db.user.findUnique({
      where: { email },
    });

    invariant(user, 'User not found');

    const isValid = await bcrypt.verify(password, user.password);
    invariant(isValid, 'Invalid password');

    return user;
  }

  static async getLoggedUser(request: Request): Promise<User | null> {
    const userFromCookies = await authenticator.isAuthenticated(request);

    if (userFromCookies instanceof Error) {
      throw redirect('/login');
    }

    if (userFromCookies) {
      //return await db.user.findUnique({ where: { id: userFromCookies.id } });
      return await this.getUserById(userFromCookies.id);
    }

    return null;
  }

  static async requireUser(request: Request): Promise<User> {
    const userFromCookies = await authenticator.isAuthenticated(request, { failureRedirect: '/login' });

    if (userFromCookies instanceof Error || !userFromCookies) {
      throw redirect('/login');
    }

    // always check user in DB to get the latest data for access control
    // const user = await db.user.findUnique({ where: { id: userFromCookies.id } });
    const user = await this.getUserById(userFromCookies.id);

    if (!user) {
      throw redirect('/login');
    }

    return user;
  }
}
