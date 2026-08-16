CREATE TABLE IF NOT EXISTS `course_details` (
	`course_id` integer PRIMARY KEY NOT NULL,
	`card_description_bn` text NOT NULL,
	`tags_bn` text NOT NULL,
	`subtitle` text NOT NULL,
	`subtitle_bn` text NOT NULL,
	`overview` text NOT NULL,
	`overview_bn` text NOT NULL,
	`duration` text NOT NULL,
	`schedule` text NOT NULL,
	`level` text NOT NULL,
	`fee` text NOT NULL,
	`modules` text NOT NULL,
	`modules_bn` text NOT NULL,
	`outcomes` text NOT NULL,
	`outcomes_bn` text NOT NULL,
	`requirements` text NOT NULL,
	`requirements_bn` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
UPDATE `courses` SET `description` = 'Complete Academic and General preparation across all four modules, with mock tests and personal feedback.' WHERE `id` = 1 AND `title` = 'IELTS Preparation';
--> statement-breakpoint
UPDATE `courses` SET `description` = 'An intensive course featuring AI-scored practice, exam strategy and focused score improvement.' WHERE `id` = 2 AND `title` = 'PTE Academic';
--> statement-breakpoint
UPDATE `courses` SET `description` = 'Oxford International English Test preparation and application guidance for UK admission.' WHERE `id` = 3 AND `title` = 'OIETC / ELLT';
--> statement-breakpoint
UPDATE `courses` SET `description` = 'A practical course designed to build confidence in everyday and professional communication.' WHERE `id` = 4 AND `title` = 'Spoken English';
--> statement-breakpoint
UPDATE `courses` SET `description` = 'N5–N4 language training for learners planning to study or build a career in Japan.' WHERE `id` = 5 AND `title` = 'Japanese Language';
--> statement-breakpoint
UPDATE `courses` SET `description` = 'A structured Korean communication programme for future study and work pathways.' WHERE `id` = 6 AND `title` = 'Korean Language';
--> statement-breakpoint
PRAGMA optimize;
