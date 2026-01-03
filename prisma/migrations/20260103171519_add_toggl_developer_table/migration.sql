-- CreateTable
CREATE TABLE `toggl_developer` (
    `toggl_developer_pk` CHAR(36) NOT NULL,
    `toggl_developer_toggl_id` INTEGER NOT NULL,
    `toggl_developer_name` VARCHAR(255) NOT NULL,
    `toggl_developer_email` VARCHAR(255) NOT NULL,
    `toggl_developer_is_active` BOOLEAN NOT NULL DEFAULT true,
    `toggl_developer_created_at` INTEGER NOT NULL,
    `toggl_developer_updated_at` INTEGER NOT NULL,

    UNIQUE INDEX `toggl_developer_toggl_id_key`(`toggl_developer_toggl_id`),
    UNIQUE INDEX `toggl_developer_email_key`(`toggl_developer_email`),
    PRIMARY KEY (`toggl_developer_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

