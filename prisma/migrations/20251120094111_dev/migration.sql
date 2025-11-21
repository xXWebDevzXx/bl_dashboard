-- CreateTable
CREATE TABLE `user` (
    `user_pk` CHAR(36) NOT NULL,
    `user_username` VARCHAR(20) NOT NULL,
    `user_password` VARCHAR(50) NOT NULL,
    `user_email` VARCHAR(50) NOT NULL,
    `user_role` VARCHAR(20) NOT NULL,
    `user_created_at` INTEGER NOT NULL,
    `user_updated_at` INTEGER NOT NULL,

    PRIMARY KEY (`user_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report` (
    `report_pk` CHAR(36) NOT NULL,
    `report_name` VARCHAR(255) NOT NULL,
    `report_url` VARCHAR(255) NOT NULL,
    `report_created_at` INTEGER NOT NULL,
    `report_updated_at` INTEGER NOT NULL,
    `userId` CHAR(36) NULL,

    PRIMARY KEY (`report_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `toggl_time` (
    `toggl_time_pk` CHAR(36) NOT NULL,
    `toggl_time_linear_tasks_fk` CHAR(36) NOT NULL,
    `toggl_time_estimate` INTEGER NOT NULL,
    `toggl_time_created_at` INTEGER NOT NULL,
    `toggl_time_updated_at` INTEGER NOT NULL,

    PRIMARY KEY (`toggl_time_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `linear_tasks` (
    `linear_tasks_pk` CHAR(36) NOT NULL,
    `linear_tasks_name` VARCHAR(50) NOT NULL,
    `linear_tasks_estimated_time` INTEGER NOT NULL,
    `linear_tasks_created_at` INTEGER NOT NULL,
    `linear_tasks_updated_at` INTEGER NOT NULL,

    PRIMARY KEY (`linear_tasks_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `linear_labels` (
    `linear_labels_pk` CHAR(36) NOT NULL,
    `linear_labels_name` VARCHAR(50) NOT NULL,
    `linear_labels_created_at` INTEGER NOT NULL,
    `linear_labels_updated_at` INTEGER NOT NULL,

    PRIMARY KEY (`linear_labels_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `linear_task_label` (
    `linear_task_label_linear_tasks_fk` CHAR(36) NOT NULL,
    `linear_task_label_linear_labels_fk` CHAR(36) NOT NULL,

    PRIMARY KEY (`linear_task_label_linear_tasks_fk`, `linear_task_label_linear_labels_fk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`user_pk`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `toggl_time` ADD CONSTRAINT `toggl_time_toggl_time_linear_tasks_fk_fkey` FOREIGN KEY (`toggl_time_linear_tasks_fk`) REFERENCES `linear_tasks`(`linear_tasks_pk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `linear_task_label` ADD CONSTRAINT `linear_task_label_linear_task_label_linear_tasks_fk_fkey` FOREIGN KEY (`linear_task_label_linear_tasks_fk`) REFERENCES `linear_tasks`(`linear_tasks_pk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `linear_task_label` ADD CONSTRAINT `linear_task_label_linear_task_label_linear_labels_fk_fkey` FOREIGN KEY (`linear_task_label_linear_labels_fk`) REFERENCES `linear_labels`(`linear_labels_pk`) ON DELETE RESTRICT ON UPDATE CASCADE;
