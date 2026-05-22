-- DropForeignKey
ALTER TABLE `activities` DROP FOREIGN KEY `Activity_boardId_fkey`;

-- DropForeignKey
ALTER TABLE `activities` DROP FOREIGN KEY `Activity_cardId_fkey`;

-- DropForeignKey
ALTER TABLE `card_labels` DROP FOREIGN KEY `CardLabel_cardId_fkey`;

-- DropForeignKey
ALTER TABLE `card_labels` DROP FOREIGN KEY `CardLabel_labelId_fkey`;

-- DropForeignKey
ALTER TABLE `card_members` DROP FOREIGN KEY `CardMember_cardId_fkey`;

-- DropForeignKey
ALTER TABLE `card_members` DROP FOREIGN KEY `CardMember_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `cards` DROP FOREIGN KEY `Card_listId_fkey`;

-- DropForeignKey
ALTER TABLE `checklist_items` DROP FOREIGN KEY `ChecklistItem_cardId_fkey`;

-- DropForeignKey
ALTER TABLE `labels` DROP FOREIGN KEY `Label_boardId_fkey`;

-- DropForeignKey
ALTER TABLE `lists` DROP FOREIGN KEY `List_boardId_fkey`;

-- DropForeignKey
ALTER TABLE `members` DROP FOREIGN KEY `Member_boardId_fkey`;

-- AddForeignKey
ALTER TABLE `lists` ADD CONSTRAINT `lists_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `boards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cards` ADD CONSTRAINT `cards_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `lists`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `labels` ADD CONSTRAINT `labels_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `boards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `boards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card_labels` ADD CONSTRAINT `card_labels_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card_labels` ADD CONSTRAINT `card_labels_labelId_fkey` FOREIGN KEY (`labelId`) REFERENCES `labels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card_members` ADD CONSTRAINT `card_members_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card_members` ADD CONSTRAINT `card_members_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_items` ADD CONSTRAINT `checklist_items_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `boards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `cards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `activities` RENAME INDEX `Activity_boardId_idx` TO `activities_boardId_idx`;

-- RenameIndex
ALTER TABLE `activities` RENAME INDEX `Activity_cardId_idx` TO `activities_cardId_idx`;

-- RenameIndex
ALTER TABLE `cards` RENAME INDEX `Card_listId_position_idx` TO `cards_listId_position_idx`;

-- RenameIndex
ALTER TABLE `checklist_items` RENAME INDEX `ChecklistItem_cardId_position_idx` TO `checklist_items_cardId_position_idx`;

-- RenameIndex
ALTER TABLE `labels` RENAME INDEX `Label_boardId_idx` TO `labels_boardId_idx`;

-- RenameIndex
ALTER TABLE `lists` RENAME INDEX `List_boardId_position_idx` TO `lists_boardId_position_idx`;

-- RenameIndex
ALTER TABLE `members` RENAME INDEX `Member_boardId_idx` TO `members_boardId_idx`;
