-- Drop existing toggl_time data
DELETE FROM toggl_time;

-- Drop foreign key constraint
ALTER TABLE `toggl_time` DROP FOREIGN KEY `toggl_time_toggl_time_linear_tasks_fk_fkey`;

-- Drop the unique constraint on linearTasksId
ALTER TABLE `toggl_time` DROP INDEX `toggl_time_toggl_time_linear_tasks_fk_key`;

-- Rename estimate to duration
ALTER TABLE `toggl_time` CHANGE COLUMN `toggl_time_estimate` `toggl_time_duration` INT NOT NULL;

-- Add new columns
ALTER TABLE `toggl_time` ADD COLUMN `toggl_time_entry_id` INT NOT NULL;
ALTER TABLE `toggl_time` ADD COLUMN `toggl_time_start` VARCHAR(255) NOT NULL;
ALTER TABLE `toggl_time` ADD COLUMN `toggl_time_stop` VARCHAR(255) NOT NULL;
ALTER TABLE `toggl_time` ADD COLUMN `toggl_time_description` VARCHAR(255) NOT NULL;

-- Create unique index on toggl_time_entry_id
CREATE UNIQUE INDEX `toggl_time_toggl_time_entry_id_key` ON `toggl_time`(`toggl_time_entry_id`);

-- Create index on linearTasksId for better query performance
CREATE INDEX `toggl_time_toggl_time_linear_tasks_fk_idx` ON `toggl_time`(`toggl_time_linear_tasks_fk`);

-- Re-add foreign key constraint
ALTER TABLE `toggl_time` ADD CONSTRAINT `toggl_time_toggl_time_linear_tasks_fk_fkey` 
  FOREIGN KEY (`toggl_time_linear_tasks_fk`) REFERENCES `linear_tasks`(`linear_tasks_task_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
