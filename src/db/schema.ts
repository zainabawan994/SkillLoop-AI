import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export interface AccessibilityPrefsRecord {
  fontSize: "normal" | "large";
  highContrast: boolean;
  ttsEnabled: boolean;
}

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull().default(""),
  role: text("role").notNull().default("learner"),
  avatar: text("avatar").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  preferredLanguage: text("preferred_language").notNull().default("en"),
  accessibilityPrefs: jsonb("accessibility_prefs")
    .$type<AccessibilityPrefsRecord>()
    .notNull(),
  streakDays: integer("streak_days").notNull().default(1),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pendingSignups = pgTable("pending_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("learner"),
  codeHash: text("code_hash").notNull(),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: timestamp("expires_at").notNull(),
  lastSentAt: timestamp("last_sent_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  attemptUuid: text("attempt_uuid").notNull(),
  userUid: text("user_uid")
    .references(() => users.uid, { onDelete: "cascade" })
    .notNull(),
  questionId: text("question_id").notNull(),
  topicId: text("topic_id").notNull(),
  topicName: text("topic_name").notNull(),
  selectedAnswer: text("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  responseTimeMs: integer("response_time_ms").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recoveryLogs = pgTable("recovery_logs", {
  id: serial("id").primaryKey(),
  logCode: text("log_code").notNull().unique(),
  timestampLabel: text("timestamp_label").notNull(),
  event: text("event").notNull(),
  component: text("component").notNull(),
  severity: text("severity").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userWorkspaces = pgTable("user_workspaces", {
  id: serial("id").primaryKey(),
  userUid: text("user_uid")
    .references(() => users.uid, { onDelete: "cascade" })
    .notNull()
    .unique(),
  workspaceData: jsonb("workspace_data")
    .$type<Record<string, unknown>>()
    .notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  attempts: many(quizAttempts),
  workspace: one(userWorkspaces, {
    fields: [users.uid],
    references: [userWorkspaces.userUid],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userUid],
    references: [users.uid],
  }),
}));

export const userWorkspacesRelations = relations(userWorkspaces, ({ one }) => ({
  user: one(users, {
    fields: [userWorkspaces.userUid],
    references: [users.uid],
  }),
}));
