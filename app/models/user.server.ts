import bcrypt from '@node-rs/bcrypt';
import { invariant } from '@remix-run/router';
import { db } from '~/utils/db.server';

import { Prisma, User } from '@prisma/client';
export type { User } from '@prisma/client';

export async function getUserById(id: number) {
  return db.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function changeUserAvatar(user_id: number) {
  const avatar = await generateRandomAvatarImage();

  return await db.user.update({
    where: { id: user_id },
    data: {
      avatar,
    },
  });
}

async function generateRandomAvatarImage() {
  const uniqueName = Math.random().toString(36).substring(2, 12);
  const avatarResponse = await fetch(
    `https://api.multiavatar.com/${uniqueName}.svg?apikey=${process.env.AVATAR_API_KEY}`
  );
  return (await avatarResponse.text()) ?? '';
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password);
  // check if at least one user exists in db
  const users = await db.user.findMany({ take: 1 });
  const isFirstUser = users.length === 0;
  const avatar = await generateRandomAvatarImage();

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

export async function deleteUserByEmail(email: string) {
  return db.user.delete({ where: { email } });
}

export async function verifyLogin(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email },
  });

  invariant(user, 'User not found');

  const isValid = await bcrypt.verify(password, user.password);
  invariant(isValid, 'Invalid password');

  return user;
}

export async function getUserLastWellKnownWords(user_id: number, count: number) {
  return await db.wordProgress.findMany({
    where: {
      user_id: user_id,
      wellKnown: {
        not: null,
      },
    },
    include: {
      word: {
        include: {
          topic: true,
        },
      },
    },
    orderBy: {
      wellKnown: 'desc',
    },
    take: count,
  });
}

export async function getUserLastKnownWords(user_id: number, count: number) {
  return await db.wordProgress.findMany({
    where: {
      user_id: user_id,
      // known is not null
      known: {
        not: null,
      },
    },
    include: {
      word: {
        include: {
          topic: true,
        },
      },
    },
    orderBy: {
      known: 'desc',
    },
    take: count,
  });
}

export type WordStatus = 'known' | 'wellKnown';
export type TotalWordsCount = {
  language: string;
  count: number;
};

export async function getUserTotalWords(user_id: number, status: WordStatus) {
  let wordStatusFilter = Prisma.sql``;

  switch (status) {
    case 'known':
      wordStatusFilter = Prisma.sql`AND wp.known IS NOT NULL`;
      break;
    case 'wellKnown':
      wordStatusFilter = Prisma.sql`AND wp.wellKnown IS NOT NULL`;
      break;
  }

  // grouped by languageSource
  const res: TotalWordsCount[] = await db.$queryRaw`
    SELECT
      languageSource as language,
      COUNT(*) as count
    FROM
    WordProgress wp
    INNER JOIN Word w ON w.id = wp.word_id
    INNER JOIN Topic t ON t.id = w.topic_id
    WHERE
      wp.user_id = ${user_id}
      ${wordStatusFilter}
    GROUP BY
      languageSource`;

  return res;
}

export async function getUserStudyingLanguages(user_id: number) {
  const languagesData = await db.studySession.groupBy({
    by: ['language'],
    _max: {
      date: true,
    },
    orderBy: {
      _max: {
        date: 'desc',
      },
    },
    where: {
      user_id,
    },
  });

  return languagesData.map((language) => language.language);
}

export async function getUserSessions(user_id: number, date: Date) {
  return await db.studySession.findMany({
    where: {
      user_id,
      date: {
        gte: date,
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
}
