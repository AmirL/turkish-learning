/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.

*/
-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    MODIFY `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Word` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `word` VARCHAR(255) NULL,
    `translation` VARCHAR(255) NULL,
    `topicId` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Topic` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserProgress` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NOT NULL,
    `wordId` INTEGER UNSIGNED NOT NULL,
    `level` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `nextReview` DATETIME(3) NULL,
    `correct` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `wrong` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `views` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    INDEX `userId`(`userId`),
    INDEX `wordId`(`wordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudySession` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `words` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `correct` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `wrong` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `known` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `shown` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    INDEX `userId`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Images` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `wordId` INTEGER UNSIGNED NOT NULL,
    `link` VARCHAR(500) NOT NULL,
    `selected` BOOLEAN NOT NULL DEFAULT false,

    INDEX `wordId`(`wordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Word` ADD CONSTRAINT `WordTopicRel` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProgress` ADD CONSTRAINT `UserProgressUserRel` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProgress` ADD CONSTRAINT `UserProgressWordRel` FOREIGN KEY (`wordId`) REFERENCES `Word`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudySession` ADD CONSTRAINT `StudySessionUserRel` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Images` ADD CONSTRAINT `ImagesWordRel` FOREIGN KEY (`wordId`) REFERENCES `Word`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
