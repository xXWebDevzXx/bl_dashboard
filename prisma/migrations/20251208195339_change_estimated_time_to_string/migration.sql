/*
  Warnings:

  - You are about to drop the column `linear_tasks_project_id` on the `linear_tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `linear_tasks` DROP COLUMN `linear_tasks_project_id`,
    MODIFY `linear_tasks_estimated_time` VARCHAR(50) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `user_deleted_at` INTEGER NOT NULL DEFAULT 0;
