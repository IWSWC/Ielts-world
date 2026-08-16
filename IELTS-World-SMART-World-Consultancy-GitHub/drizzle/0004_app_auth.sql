CREATE TABLE IF NOT EXISTS `auth_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text,
	`password_salt` text,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`google_sub` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `auth_users_email_unique` ON `auth_users` (`email`);
CREATE UNIQUE INDEX IF NOT EXISTS `auth_users_google_sub_unique` ON `auth_users` (`google_sub`);
CREATE TABLE IF NOT EXISTS `auth_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS `auth_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`purpose` text NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_auth_sessions_user_expiry` ON `auth_sessions` (`user_id`,`expires_at`);
CREATE INDEX IF NOT EXISTS `idx_auth_codes_lookup` ON `auth_codes` (`email`,`purpose`,`expires_at`);
