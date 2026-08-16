CREATE TABLE `appointments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `phone` text NOT NULL,
  `service` text NOT NULL,
  `preferred_date` text,
  `message` text,
  `status` text DEFAULT 'Requested' NOT NULL,
  `admin_note` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verified_contacts` (
  `user_id` text PRIMARY KEY NOT NULL,
  `phone` text NOT NULL,
  `verified_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `courses` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `icon` text NOT NULL,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `tags` text NOT NULL,
  `active` integer DEFAULT 1 NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `offers` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `button_label` text NOT NULL,
  `button_href` text NOT NULL,
  `active` integer DEFAULT 1 NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text NOT NULL,
  `title` text NOT NULL,
  `message` text NOT NULL,
  `read_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
  `bucket_key` text PRIMARY KEY NOT NULL,
  `count` integer DEFAULT 0 NOT NULL,
  `reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_appointments_user_created` ON `appointments` (`user_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `idx_appointments_status_created` ON `appointments` (`status`,`created_at`);
--> statement-breakpoint
CREATE INDEX `idx_notifications_user_created` ON `notifications` (`user_id`,`created_at`);
