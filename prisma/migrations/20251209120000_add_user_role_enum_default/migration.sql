-- AlterTable
-- Add default value to user_role column
-- Note: MySQL doesn't support native enums, so Prisma stores enum values as VARCHAR
-- This migration adds a default value and ensures existing NULL values are set to 'user'
ALTER TABLE `user` 
MODIFY COLUMN `user_role` VARCHAR(20) NOT NULL DEFAULT 'user';

-- Update any existing NULL values to 'user'
UPDATE `user` SET `user_role` = 'user' WHERE `user_role` IS NULL OR `user_role` = '';
