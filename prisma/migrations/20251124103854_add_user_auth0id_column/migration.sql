/*
  Warnings:

  - A unique constraint covering the columns `[user_auth0_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `user_auth0_id` VARCHAR(255) NULL,
    MODIFY `user_password` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_user_auth0_id_key` ON `user`(`user_auth0_id`);

-- CreateIndex
CREATE INDEX `user_user_auth0_id_idx` ON `user`(`user_auth0_id`);
