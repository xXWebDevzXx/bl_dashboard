-- AlterTable
ALTER TABLE `user` ADD COLUMN `user_is_verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `user_verification_token` VARCHAR(255) NULL;
