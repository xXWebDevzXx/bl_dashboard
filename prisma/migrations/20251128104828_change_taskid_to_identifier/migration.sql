-- Delete existing data since we're changing the format
DELETE FROM linear_task_label;
DELETE FROM toggl_time;
DELETE FROM linear_tasks;

-- Drop foreign key constraint
ALTER TABLE `toggl_time` DROP FOREIGN KEY `toggl_time_toggl_time_linear_tasks_fk_fkey`;

-- AlterTable: Change taskId from UUID to identifier format
ALTER TABLE `linear_tasks` MODIFY `linear_tasks_task_id` VARCHAR(50) NOT NULL;

-- AlterTable: Change linearTasksId to match new format
ALTER TABLE `toggl_time` MODIFY `toggl_time_linear_tasks_fk` VARCHAR(50) NOT NULL;

-- Re-add foreign key constraint
ALTER TABLE `toggl_time` ADD CONSTRAINT `toggl_time_toggl_time_linear_tasks_fk_fkey` 
  FOREIGN KEY (`toggl_time_linear_tasks_fk`) REFERENCES `linear_tasks`(`linear_tasks_task_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
