-- AlterTable
ALTER TABLE `user` ALTER COLUMN `user_role` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `linear_tasks_linear_tasks_created_at_idx` ON `linear_tasks`(`linear_tasks_created_at`);

-- CreateIndex
CREATE INDEX `linear_tasks_linear_tasks_started_at_idx` ON `linear_tasks`(`linear_tasks_started_at`);

-- CreateIndex
CREATE INDEX `linear_tasks_linear_tasks_completed_at_idx` ON `linear_tasks`(`linear_tasks_completed_at`);

-- CreateIndex
CREATE INDEX `linear_tasks_linear_tasks_updated_at_idx` ON `linear_tasks`(`linear_tasks_updated_at`);

-- CreateIndex
CREATE INDEX `linear_tasks_linear_tasks_delegate_id_idx` ON `linear_tasks`(`linear_tasks_delegate_id`);

-- CreateIndex
CREATE INDEX `toggl_time_toggl_time_start_idx` ON `toggl_time`(`toggl_time_start`);

-- RenameIndex
ALTER TABLE `toggl_developer` RENAME INDEX `toggl_developer_email_key` TO `toggl_developer_toggl_developer_email_key`;

-- RenameIndex
ALTER TABLE `toggl_developer` RENAME INDEX `toggl_developer_toggl_id_key` TO `toggl_developer_toggl_developer_toggl_id_key`;
