CREATE TABLE `enquiries` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `name` text NOT NULL, `phone` text NOT NULL,
  `interest` text NOT NULL, `status` text DEFAULT 'new' NOT NULL, `assigned_to` text, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
  `user_id` text PRIMARY KEY NOT NULL, `email` text NOT NULL, `full_name` text, `phone` text,
  `destination` text, `service` text, `application_status` text DEFAULT 'Profile Created' NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documents` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `user_id` text NOT NULL, `object_key` text NOT NULL,
  `filename` text NOT NULL, `content_type` text NOT NULL, `size` integer NOT NULL, `category` text NOT NULL,
  `status` text DEFAULT 'Pending Review' NOT NULL, `admin_note` text, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `documents_object_key_unique` ON `documents` (`object_key`);
--> statement-breakpoint
CREATE INDEX `idx_documents_user_id` ON `documents` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_enquiries_status_created` ON `enquiries` (`status`,`created_at`);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `actor_id` text NOT NULL, `action` text NOT NULL,
  `target_id` text, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
