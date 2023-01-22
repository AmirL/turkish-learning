-- DropForeignKey
ALTER TABLE `Images` DROP FOREIGN KEY `ImagesWordRel`;

-- DropForeignKey
ALTER TABLE `StudySession` DROP FOREIGN KEY `StudySessionUserRel`;

-- DropForeignKey
ALTER TABLE `UserProgress` DROP FOREIGN KEY `UserProgressUserRel`;

-- DropForeignKey
ALTER TABLE `UserProgress` DROP FOREIGN KEY `UserProgressWordRel`;

-- DropForeignKey
ALTER TABLE `Word` DROP FOREIGN KEY `WordTopicRel`;

-- AddForeignKey
ALTER TABLE `Word` ADD CONSTRAINT `Word_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProgress` ADD CONSTRAINT `UserProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProgress` ADD CONSTRAINT `UserProgress_wordId_fkey` FOREIGN KEY (`wordId`) REFERENCES `Word`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudySession` ADD CONSTRAINT `StudySession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Images` ADD CONSTRAINT `Images_wordId_fkey` FOREIGN KEY (`wordId`) REFERENCES `Word`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
