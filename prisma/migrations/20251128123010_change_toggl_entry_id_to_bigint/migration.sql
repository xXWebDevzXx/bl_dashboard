-- AlterTable: Change togglEntryId from INT to BIGINT
ALTER TABLE `toggl_time` MODIFY `toggl_time_entry_id` BIGINT NOT NULL;
