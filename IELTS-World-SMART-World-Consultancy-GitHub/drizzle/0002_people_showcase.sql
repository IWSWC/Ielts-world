CREATE TABLE `teachers` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `profession` text NOT NULL,
  `organization` text,
  `qualifications` text NOT NULL,
  `experience` text NOT NULL,
  `expertise` text NOT NULL,
  `bio` text NOT NULL,
  `achievements` text,
  `photo_object_key` text,
  `photo_content_type` text,
  `consent_confirmed` integer DEFAULT 0 NOT NULL,
  `active` integer DEFAULT 0 NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `student_stories` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `program` text NOT NULL,
  `destination` text,
  `result` text,
  `quote` text NOT NULL,
  `photo_object_key` text,
  `photo_content_type` text,
  `consent_confirmed` integer DEFAULT 0 NOT NULL,
  `active` integer DEFAULT 0 NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_teachers_active_sort` ON `teachers` (`active`,`consent_confirmed`,`sort_order`);
--> statement-breakpoint
CREATE INDEX `idx_student_stories_active_sort` ON `student_stories` (`active`,`consent_confirmed`,`sort_order`);
