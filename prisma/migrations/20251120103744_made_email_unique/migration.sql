/*
  Warnings:

  - A unique constraint covering the columns `[user_email]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `user_user_email_key` ON `user`(`user_email`);
