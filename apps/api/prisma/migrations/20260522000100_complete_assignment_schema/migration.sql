-- Rename assignment-critical tables to the expected production names.
RENAME TABLE
  `Board` TO `boards`,
  `List` TO `lists`,
  `Card` TO `cards`,
  `Label` TO `labels`,
  `Member` TO `members`,
  `CardLabel` TO `card_labels`,
  `CardMember` TO `card_members`,
  `ChecklistItem` TO `checklist_items`,
  `Activity` TO `activities`;

-- Complete existing core tables.
ALTER TABLE `boards`
  ADD COLUMN `visibility` VARCHAR(191) NOT NULL DEFAULT 'workspace';

ALTER TABLE `cards`
  ADD COLUMN `coverImage` VARCHAR(191) NULL,
  ADD COLUMN `dueReminder` VARCHAR(191) NULL,
  ADD COLUMN `dueCompleted` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `members`
  ADD COLUMN `userId` VARCHAR(191) NULL;

-- User accounts behind board members.
CREATE TABLE `users` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `avatarUrl` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `users_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Persistent card comments.
CREATE TABLE `comments` (
  `id` VARCHAR(191) NOT NULL,
  `cardId` VARCHAR(191) NOT NULL,
  `memberId` VARCHAR(191) NULL,
  `text` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `comments_cardId_idx`(`cardId`),
  INDEX `comments_memberId_idx`(`memberId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Uploaded files and external attachment references.
CREATE TABLE `attachments` (
  `id` VARCHAR(191) NOT NULL,
  `cardId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `url` VARCHAR(191) NOT NULL,
  `mimeType` VARCHAR(191) NULL,
  `size` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `attachments_cardId_idx`(`cardId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- In-app due date and activity notifications.
CREATE TABLE `notifications` (
  `id` VARCHAR(191) NOT NULL,
  `cardId` VARCHAR(191) NULL,
  `memberId` VARCHAR(191) NULL,
  `userId` VARCHAR(191) NULL,
  `type` VARCHAR(191) NOT NULL,
  `message` VARCHAR(191) NOT NULL,
  `read` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `notifications_cardId_idx`(`cardId`),
  INDEX `notifications_memberId_idx`(`memberId`),
  INDEX `notifications_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `members_userId_idx` ON `members`(`userId`);

ALTER TABLE `members` ADD CONSTRAINT `members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `comments` ADD CONSTRAINT `comments_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `comments` ADD CONSTRAINT `comments_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
