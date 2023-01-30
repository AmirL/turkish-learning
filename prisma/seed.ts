import { PrismaClient } from '@prisma/client';

import { faker } from '@faker-js/faker';
import { hashPassword } from '~/models/user.server';

const prisma = new PrismaClient();

async function generateRandomAvatarImage() {
  const uniqueName = Math.random().toString(36).substring(2, 12);
  const avatarResponse = await fetch(
    `https://api.multiavatar.com/${uniqueName}.svg?apikey=${process.env.AVATAR_API_KEY}`
  );
  return (await avatarResponse.text()) ?? '';
}

async function main() {
  // create admin user
  const adminAvatar = await generateRandomAvatarImage();
  const count = await prisma.user.count();
  if (count === 0) {
    await prisma.user.create({
      data: {
        email: 'Admin',
        name: 'Admin',
        password: await hashPassword('admin'),
        avatar: adminAvatar,
        isAdmin: true,
        isEditor: true,
      },
    });
  }

  // seed random users
  for (let i = 0; i < 15 - count; i++) {
    const avatar = await generateRandomAvatarImage();
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.name.firstName(),
        password: await hashPassword(faker.internet.password()),
        avatar,
        isAdmin: false,
        isEditor: false,
      },
    });
    console.log(`Created user with id: ${user.id}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
