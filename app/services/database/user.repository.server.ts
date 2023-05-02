import type { User } from '@prisma/client';
import { db } from '~/utils/db.server';

type CreateUserInput = Pick<User, 'name' | 'email' | 'password' | 'avatar'> & Partial<User>;

export class UserRepository {
  static async findByEmail(email: string) {
    return db.user.findUnique({ where: { email } });
  }

  static async findById(id: number) {
    return db.user.findUnique({ where: { id } });
  }

  static async update(id: number, data: Partial<User>) {
    return db.user.update({ where: { id }, data });
  }

  static async create(data: CreateUserInput) {
    return db.user.create({ data });
  }

  static async getWordsByTopicId(topicId: number) {
    return await db.word.findMany({
      include: {
        topic: true,
      },
      where: {
        topic_id: Number(topicId),
      },
    });
  }

  static async createWords(words: { word: string; translation: string; topic_id: number }[]) {
    return await db.word.createMany({
      data: words,
      skipDuplicates: true,
    });
  }

  static async count() {
    return await db.user.count();
  }
}
