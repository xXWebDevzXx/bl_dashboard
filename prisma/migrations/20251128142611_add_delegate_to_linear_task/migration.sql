-- AlterTable: Add delegate fields to LinearTask
ALTER TABLE `linear_tasks` ADD COLUMN `linear_tasks_delegate_id` VARCHAR(255) NULL;
ALTER TABLE `linear_tasks` ADD COLUMN `linear_tasks_delegate_name` VARCHAR(255) NULL;
