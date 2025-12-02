/*
  Warnings:

  - A unique constraint covering the columns `[linear_labels_name]` on the table `linear_labels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[linear_tasks_task_id]` on the table `linear_tasks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `linear_tasks_task_id` to the `linear_tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `toggl_time` DROP FOREIGN KEY `toggl_time_toggl_time_linear_tasks_fk_fkey`;

-- DropIndex
DROP INDEX `toggl_time_toggl_time_linear_tasks_fk_fkey` ON `toggl_time`;

-- AlterTable
ALTER TABLE `linear_tasks` ADD COLUMN `linear_tasks_task_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `linear_labels_linear_labels_name_key` ON `linear_labels`(`linear_labels_name`);

-- CreateIndex
CREATE UNIQUE INDEX `linear_tasks_linear_tasks_task_id_key` ON `linear_tasks`(`linear_tasks_task_id`);

-- AddForeignKey
ALTER TABLE `toggl_time` ADD CONSTRAINT `toggl_time_toggl_time_linear_tasks_fk_fkey` FOREIGN KEY (`toggl_time_linear_tasks_fk`) REFERENCES `linear_tasks`(`linear_tasks_task_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
