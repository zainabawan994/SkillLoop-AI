CREATE TABLE "pending_signups" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'learner' NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_sent_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pending_signups_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_uuid" text NOT NULL,
	"user_uid" text NOT NULL,
	"question_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"topic_name" text NOT NULL,
	"selected_answer" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"response_time_ms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recovery_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"log_code" text NOT NULL,
	"timestamp_label" text NOT NULL,
	"event" text NOT NULL,
	"component" text NOT NULL,
	"severity" text NOT NULL,
	"detail" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recovery_logs_log_code_unique" UNIQUE("log_code")
);
--> statement-breakpoint
CREATE TABLE "user_workspaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_uid" text NOT NULL,
	"workspace_data" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_workspaces_user_uid_unique" UNIQUE("user_uid")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text DEFAULT '' NOT NULL,
	"role" text DEFAULT 'learner' NOT NULL,
	"avatar" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"preferred_language" text DEFAULT 'en' NOT NULL,
	"accessibility_prefs" jsonb NOT NULL,
	"streak_days" integer DEFAULT 1 NOT NULL,
	"last_active_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workspaces" ADD CONSTRAINT "user_workspaces_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;