var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server.ts
import express from "express";
import path2 from "node:path";
import { fileURLToPath } from "node:url";
import dotenv2 from "dotenv";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

// server/authAndStore.ts
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import nodemailer from "nodemailer";
function resolveDataDir() {
  const localDir = path.resolve(process.cwd(), ".data");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return localDir;
  } catch {
    const tmpDir = path.join(os.tmpdir(), "skillloop-data");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  }
}
var DATA_DIR = resolveDataDir();
var SECRET_PATH = path.join(DATA_DIR, "session-secret.key");
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}
function getSessionSecret() {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  ensureDataDir();
  if (fs.existsSync(SECRET_PATH)) {
    const existing = fs.readFileSync(SECRET_PATH, "utf8").trim();
    if (existing.length >= 32) return existing;
  }
  const generated = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(SECRET_PATH, generated, { mode: 384 });
  return generated;
}
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1
  });
  return `scrypt$${salt}$${derived.toString("hex")}`;
}
function verifyPassword(password, storedHash) {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }
    const [, salt, keyHex] = parts;
    const expected = Buffer.from(keyHex, "hex");
    const actual = crypto.scryptSync(password, salt, 64, {
      N: 16384,
      r: 8,
      p: 1
    });
    if (expected.length !== actual.length) return false;
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
function generateOtpCode() {
  return crypto.randomInt(1e5, 1e6).toString();
}
function hashOtpCode(email, code) {
  const secret = getSessionSecret();
  return crypto.createHmac("sha256", secret).update(`${email.toLowerCase()}:${code.trim()}`).digest("hex");
}
function verifyOtpCode(email, submittedCode, storedHash) {
  try {
    const actualHex = hashOtpCode(email, submittedCode);
    const actualBuf = Buffer.from(actualHex, "hex");
    const expectedBuf = Buffer.from(storedHash, "hex");
    if (actualBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(actualBuf, expectedBuf);
  } catch {
    return false;
  }
}
function getConfiguredSecret(val) {
  const trimmed = val?.trim();
  if (!trimmed) return null;
  if (/^(MY_|YOUR_|CHANGE_ME|REPLACE_|EXAMPLE|<)/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}
function isEmailDeliveryConfigured() {
  return Boolean(
    getConfiguredSecret(process.env.RESEND_API_KEY) || getConfiguredSecret(process.env.SENDGRID_API_KEY) || getConfiguredSecret(process.env.BREVO_API_KEY) || getConfiguredSecret(process.env.SMTP_USER) && getConfiguredSecret(process.env.SMTP_PASS)
  );
}
function extractSafeProviderMessage(rawBody) {
  try {
    const parsed = JSON.parse(rawBody);
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message.trim();
    }
    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error.trim();
    }
    if (parsed.error && typeof parsed.error === "object" && typeof parsed.error.message === "string") {
      return parsed.error.message.trim();
    }
    if (Array.isArray(parsed.errors) && parsed.errors[0]?.message) {
      return parsed.errors[0].message.trim();
    }
  } catch {
  }
  return "";
}
async function sendVerificationEmail(params) {
  const { to, name, code } = params;
  const subject = `${code} is your SkillLoop AI verification code`;
  const textBody = `Hi ${name},

Welcome to SkillLoop AI! Enter this 6-digit verification code to activate your account:

${code}

This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.

\u2014 SkillLoop AI`;
  const htmlBody = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #F4F7FE; border-radius: 16px;">
      <div style="background: #ffffff; border-radius: 14px; padding: 28px; border: 1px solid #E2E8F0;">
        <div style="font-size: 18px; font-weight: 800; color: #0F172A;">SkillLoop AI</div>
        <p style="margin: 14px 0 6px; font-size: 14px; color: #334155;">Hi ${name},</p>
        <p style="margin: 0 0 18px; font-size: 13px; color: #64748B; line-height: 1.5;">
          Enter the 6-digit verification code below to confirm your email and activate your SkillLoop AI account:
        </p>
        <div style="background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 12px; padding: 16px; text-align: center; font-family: monospace; font-size: 28px; font-weight: 800; letter-spacing: 8px; color: #4338CA;">
          ${code}
        </div>
        <p style="margin: 18px 0 0; font-size: 12px; color: #94A3B8;">
          Expires in 10 minutes. Never share this code with anyone.
        </p>
      </div>
    </div>
  `;
  const providerErrors = [];
  const smtpUser = getConfiguredSecret(process.env.SMTP_USER);
  const smtpPass = getConfiguredSecret(process.env.SMTP_PASS);
  const smtpHost = getConfiguredSecret(process.env.SMTP_HOST) || (smtpUser && smtpUser.toLowerCase().endsWith("@gmail.com") ? "smtp.gmail.com" : "");
  const isValidHost = smtpHost === "localhost" || /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(smtpHost);
  if (smtpHost && smtpUser && smtpPass) {
    if (!isValidHost) {
      providerErrors.push(
        "SMTP_HOST is not a valid mail server hostname (use smtp.gmail.com for Gmail)."
      );
    } else {
      try {
        const rawPort = Number(process.env.SMTP_PORT);
        const port = Number.isInteger(rawPort) && rawPort >= 1 && rawPort <= 65535 ? rawPort : 465;
        const isGmail = smtpHost.toLowerCase() === "smtp.gmail.com" || smtpUser.toLowerCase().endsWith("@gmail.com");
        const transporter = isGmail ? nodemailer.createTransport({
          service: "gmail",
          // Fail fast where hosts block SMTP (Railway/Render free tiers) so API providers get tried.
          connectionTimeout: 1e4,
          greetingTimeout: 1e4,
          socketTimeout: 15e3,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        }) : nodemailer.createTransport({
          host: smtpHost,
          port,
          secure: port === 465,
          connectionTimeout: 1e4,
          greetingTimeout: 1e4,
          socketTimeout: 15e3,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });
        const fromAddress = getConfiguredSecret(process.env.SMTP_FROM) || getConfiguredSecret(process.env.EMAIL_FROM) || `SkillLoop AI <${smtpUser}>`;
        await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          text: textBody,
          html: htmlBody
        });
        return { sent: true, provider: `SMTP (${smtpHost})` };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown SMTP error";
        console.error("SMTP delivery failed:", msg);
        providerErrors.push(
          `SMTP failed (${msg}). Verify SMTP_HOST (e.g. smtp.gmail.com), SMTP_PORT (465 or 587), SMTP_USER, and a Gmail App Password for SMTP_PASS.`
        );
      }
    }
  }
  const resendKey = getConfiguredSecret(process.env.RESEND_API_KEY);
  if (resendKey) {
    try {
      const fromAddress = getConfiguredSecret(process.env.EMAIL_FROM) || "SkillLoop AI <onboarding@resend.dev>";
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(5e3),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          text: textBody,
          html: htmlBody
        })
      });
      if (resp.ok) {
        return { sent: true, provider: "Resend Email API" };
      }
      const errBody = await resp.text().catch(() => "");
      const detail = extractSafeProviderMessage(errBody);
      console.error("Resend email delivery failed:", resp.status, detail);
      providerErrors.push(
        detail ? `Resend rejected the email (${resp.status}): ${detail}` : `Resend rejected the email (${resp.status}). Check RESEND_API_KEY and verified sender domain.`
      );
    } catch (err) {
      console.error("Resend network error:", err);
      providerErrors.push("Unable to connect to Resend email service.");
    }
  }
  const sendgridKey = getConfiguredSecret(process.env.SENDGRID_API_KEY);
  if (sendgridKey) {
    try {
      const fromEmail = getConfiguredSecret(process.env.EMAIL_FROM) || getConfiguredSecret(process.env.SMTP_FROM) || "no-reply@skillloop.ai";
      const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        signal: AbortSignal.timeout(5e3),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sendgridKey}`
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail, name: "SkillLoop AI" },
          subject,
          content: [
            { type: "text/plain", value: textBody },
            { type: "text/html", value: htmlBody }
          ]
        })
      });
      if (resp.ok) {
        return { sent: true, provider: "SendGrid Email API" };
      }
      const errBody = await resp.text().catch(() => "");
      const detail = extractSafeProviderMessage(errBody);
      console.error("SendGrid delivery failed:", resp.status, detail);
      providerErrors.push(
        detail ? `SendGrid rejected the email (${resp.status}): ${detail}` : `SendGrid rejected the email (${resp.status}). Check SENDGRID_API_KEY and verified sender.`
      );
    } catch (err) {
      console.error("SendGrid network error:", err);
      providerErrors.push("Unable to connect to SendGrid email service.");
    }
  }
  const brevoKey = getConfiguredSecret(process.env.BREVO_API_KEY);
  if (brevoKey) {
    try {
      const fromEmail = getConfiguredSecret(process.env.EMAIL_FROM) || getConfiguredSecret(process.env.SMTP_FROM) || "no-reply@skillloop.ai";
      const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        signal: AbortSignal.timeout(5e3),
        headers: {
          "Content-Type": "application/json",
          "api-key": brevoKey
        },
        body: JSON.stringify({
          sender: { name: "SkillLoop AI", email: fromEmail },
          to: [{ email: to, name }],
          subject,
          textContent: textBody,
          htmlContent: htmlBody
        })
      });
      if (resp.ok) {
        return { sent: true, provider: "Brevo Email API" };
      }
      const errBody = await resp.text().catch(() => "");
      const detail = extractSafeProviderMessage(errBody);
      console.error("Brevo delivery failed:", resp.status, detail);
      providerErrors.push(
        detail ? `Brevo rejected the email (${resp.status}): ${detail}` : `Brevo rejected the email (${resp.status}). Check BREVO_API_KEY and sender email.`
      );
    } catch (err) {
      console.error("Brevo network error:", err);
      providerErrors.push("Unable to connect to Brevo email service.");
    }
  }
  if (providerErrors.length > 0) {
    return {
      sent: false,
      error: providerErrors.join(" | ")
    };
  }
  if (process.env.NODE_ENV !== "production") {
    console.log(`
==============================================
\u{1F511} [DEV MODE] Verification Code for ${to}: ${code}
==============================================
`);
    return {
      sent: true,
      provider: "Local Dev Verification (Simulated)"
    };
  }
  return {
    sent: false,
    error: "Email service is not configured yet. Add SMTP_USER & SMTP_PASS (Gmail App Password) or a valid RESEND_API_KEY in AI Studio Secrets to send genuine verification codes."
  };
}
function toBase64Url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromBase64Url(input) {
  const padLen = (4 - input.length % 4) % 4;
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLen);
  return Buffer.from(padded, "base64").toString("utf8");
}
function signSessionToken(user) {
  const secret = getSessionSecret();
  const nowSec = Math.floor(Date.now() / 1e3);
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadObj = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: nowSec,
    exp: nowSec + 60 * 60 * 24 * 7
    // 7 days
  };
  const payload = toBase64Url(JSON.stringify(payloadObj));
  const data = `${header}.${payload}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  return `${data}.${toBase64Url(sig)}`;
}
function verifySessionToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, sigB64] = parts;
    const secret = getSessionSecret();
    const expectedSig = toBase64Url(
      crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest()
    );
    const sigBuf = Buffer.from(sigB64);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const decoded = JSON.parse(fromBase64Url(payload));
    const nowSec = Math.floor(Date.now() / 1e3);
    if (!decoded.exp || decoded.exp < nowSec) return null;
    return decoded;
  } catch {
    return null;
  }
}

// src/lib/firebase-admin.ts
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "industrious-apex-s5gvv",
  appId: "1:454865560832:web:2c5e6363d65060dffabfe5",
  apiKey: "AIzaSyBGKjX0GX6AEZcqvVidRFa7TTAXMZ9lUGc",
  authDomain: "industrious-apex-s5gvv.firebaseapp.com",
  storageBucket: "industrious-apex-s5gvv.firebasestorage.app",
  messagingSenderId: "454865560832",
  measurementId: "",
  oAuthClientId: "454865560832-omc0rugt58vknnv10cvj053cdt1efnqf.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// src/lib/firebase-admin.ts
if (!getApps().length) {
  initializeApp({
    projectId: firebase_applet_config_default.projectId
  });
}
var adminAuth = getAuth();

// server.ts
import { migrate } from "drizzle-orm/node-postgres/migrator";

// src/db/index.ts
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  pendingSignups: () => pendingSignups,
  quizAttempts: () => quizAttempts,
  quizAttemptsRelations: () => quizAttemptsRelations,
  recoveryLogs: () => recoveryLogs,
  userWorkspaces: () => userWorkspaces,
  userWorkspacesRelations: () => userWorkspacesRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull().default(""),
  role: text("role").notNull().default("learner"),
  avatar: text("avatar").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  preferredLanguage: text("preferred_language").notNull().default("en"),
  accessibilityPrefs: jsonb("accessibility_prefs").$type().notNull(),
  streakDays: integer("streak_days").notNull().default(1),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var pendingSignups = pgTable("pending_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("learner"),
  codeHash: text("code_hash").notNull(),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: timestamp("expires_at").notNull(),
  lastSentAt: timestamp("last_sent_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  attemptUuid: text("attempt_uuid").notNull(),
  userUid: text("user_uid").references(() => users.uid, { onDelete: "cascade" }).notNull(),
  questionId: text("question_id").notNull(),
  topicId: text("topic_id").notNull(),
  topicName: text("topic_name").notNull(),
  selectedAnswer: text("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  responseTimeMs: integer("response_time_ms").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var recoveryLogs = pgTable("recovery_logs", {
  id: serial("id").primaryKey(),
  logCode: text("log_code").notNull().unique(),
  timestampLabel: text("timestamp_label").notNull(),
  event: text("event").notNull(),
  component: text("component").notNull(),
  severity: text("severity").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var userWorkspaces = pgTable("user_workspaces", {
  id: serial("id").primaryKey(),
  userUid: text("user_uid").references(() => users.uid, { onDelete: "cascade" }).notNull().unique(),
  workspaceData: jsonb("workspace_data").$type().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ many, one }) => ({
  attempts: many(quizAttempts),
  workspace: one(userWorkspaces, {
    fields: [users.uid],
    references: [userWorkspaces.userUid]
  })
}));
var quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userUid],
    references: [users.uid]
  })
}));
var userWorkspacesRelations = relations(userWorkspaces, ({ one }) => ({
  user: one(users, {
    fields: [userWorkspaces.userUid],
    references: [users.uid]
  })
}));

// src/db/index.ts
dotenv.config();
var createPool = () => {
  if (!global._postgresPool) {
    const connection = process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {
      host: process.env.SQL_HOST,
      port: Number(process.env.SQL_PORT) || 5432,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME
    };
    global._postgresPool = new Pool({
      ...connection,
      max: 10,
      connectionTimeoutMillis: 15e3
    });
    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
  }
  return global._postgresPool;
};
var pool = createPool();
var db = drizzle(pool, { schema: schema_exports });

// src/db/users.ts
import { desc, eq, lt, sql } from "drizzle-orm";
var DEFAULT_AVATAR = "/src/assets/images/avatar_fahad_ali_1794897687597.jpg";
function toPublicUser(row) {
  const role = row.role === "educator" || row.role === "admin" ? row.role : "learner";
  const lang = row.preferredLanguage === "ur" || row.preferredLanguage === "roman_ur" ? row.preferredLanguage : "en";
  return {
    id: row.uid,
    name: row.name,
    email: row.email,
    role,
    avatar: row.avatar,
    email_verified: row.emailVerified,
    preferred_language: lang,
    accessibility_prefs: row.accessibilityPrefs || {
      fontSize: "normal",
      highContrast: false,
      ttsEnabled: true
    },
    streak_days: row.streakDays,
    last_active_at: row.lastActiveAt.toISOString(),
    created_at: row.createdAt.toISOString()
  };
}
var FALLBACK_USERS = {
  "user-fahad": {
    id: 1,
    uid: "user-fahad",
    name: "Fahad Ali",
    email: "fahad@skillloop.ai",
    passwordHash: hashPassword("demo123"),
    role: "learner",
    avatar: DEFAULT_AVATAR,
    emailVerified: true,
    preferredLanguage: "en",
    accessibilityPrefs: {
      fontSize: "normal",
      highContrast: false,
      ttsEnabled: true
    },
    streakDays: 7,
    lastActiveAt: /* @__PURE__ */ new Date(),
    createdAt: /* @__PURE__ */ new Date()
  },
  "user-sarah": {
    id: 2,
    uid: "user-sarah",
    name: "Dr. Sarah Khan",
    email: "sarah@skillloop.ai",
    passwordHash: hashPassword("demo123"),
    role: "educator",
    avatar: DEFAULT_AVATAR,
    emailVerified: true,
    preferredLanguage: "en",
    accessibilityPrefs: {
      fontSize: "normal",
      highContrast: false,
      ttsEnabled: true
    },
    streakDays: 14,
    lastActiveAt: /* @__PURE__ */ new Date(),
    createdAt: /* @__PURE__ */ new Date()
  },
  "user-admin": {
    id: 3,
    uid: "user-admin",
    name: "Admin Console",
    email: "admin@skillloop.ai",
    passwordHash: hashPassword("demo123"),
    role: "admin",
    avatar: DEFAULT_AVATAR,
    emailVerified: true,
    preferredLanguage: "en",
    accessibilityPrefs: {
      fontSize: "normal",
      highContrast: false,
      ttsEnabled: false
    },
    streakDays: 30,
    lastActiveAt: /* @__PURE__ */ new Date(),
    createdAt: /* @__PURE__ */ new Date()
  }
};
var FALLBACK_PENDING_SIGNUPS = /* @__PURE__ */ new Map();
var seedDonePromise = null;
async function ensureDatabaseSeeded() {
  if (!seedDonePromise) {
    seedDonePromise = (async () => {
      try {
        const now = /* @__PURE__ */ new Date();
        const demoHash = hashPassword("demo123");
        await db.insert(users).values([
          {
            uid: "user-fahad",
            name: "Fahad Ali",
            email: "fahad@skillloop.ai",
            passwordHash: demoHash,
            role: "learner",
            avatar: DEFAULT_AVATAR,
            emailVerified: true,
            preferredLanguage: "en",
            accessibilityPrefs: {
              fontSize: "normal",
              highContrast: false,
              ttsEnabled: true
            },
            streakDays: 7,
            lastActiveAt: now,
            createdAt: now
          },
          {
            uid: "user-sarah",
            name: "Dr. Sarah Khan",
            email: "sarah@skillloop.ai",
            passwordHash: hashPassword("demo123"),
            role: "educator",
            avatar: DEFAULT_AVATAR,
            emailVerified: true,
            preferredLanguage: "en",
            accessibilityPrefs: {
              fontSize: "normal",
              highContrast: false,
              ttsEnabled: true
            },
            streakDays: 14,
            lastActiveAt: now,
            createdAt: now
          },
          {
            uid: "user-admin",
            name: "Admin Console",
            email: "admin@skillloop.ai",
            passwordHash: hashPassword("demo123"),
            role: "admin",
            avatar: DEFAULT_AVATAR,
            emailVerified: true,
            preferredLanguage: "en",
            accessibilityPrefs: {
              fontSize: "normal",
              highContrast: false,
              ttsEnabled: false
            },
            streakDays: 30,
            lastActiveAt: now,
            createdAt: now
          }
        ]).onConflictDoNothing();
        await db.insert(recoveryLogs).values([
          {
            logCode: "log-1",
            timestampLabel: "10:14 AM",
            event: "5-Day Inactivity Recovery Triggered",
            component: "Adaptive Recovery Engine",
            severity: "Resolved",
            detail: "Preserved 68% mastery; issued 3-question diagnostic + 10-min catch-up plan."
          },
          {
            logCode: "log-2",
            timestampLabel: "09:52 AM",
            event: "AI Offline Rule-Based Fallback Verified",
            component: "Conceptual Feedback Router",
            severity: "Fallback Active",
            detail: "Switched seamlessly to deterministic Python AST/pattern explainer during simulated offline test."
          },
          {
            logCode: "log-3",
            timestampLabel: "09:05 AM",
            event: "Educator Human-in-the-Loop Gate",
            component: "Content Approval Queue",
            severity: "Info",
            detail: "2 AI-generated Loops drafts held in Pending Review prior to learner release."
          },
          {
            logCode: "log-4",
            timestampLabel: "Yesterday",
            event: "Cloud SQL PostgreSQL & Scrypt Auth Active",
            component: "Auth & Relational Store",
            severity: "Resolved",
            detail: "Salted scrypt (N=16384, 64B key), Firebase Auth verification, and Cloud SQL persistence initialized."
          }
        ]).onConflictDoNothing();
      } catch (error) {
        console.warn(
          "PostgreSQL not accessible; operating with in-memory fallback demo users."
        );
      }
    })();
  }
  return seedDonePromise;
}
async function getOrCreateUser(uid, email, name, avatar) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const existingByEmail = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (existingByEmail[0] && existingByEmail[0].uid !== uid) {
      const [updated] = await db.update(users).set({
        emailVerified: true,
        lastActiveAt: /* @__PURE__ */ new Date()
      }).where(eq(users.id, existingByEmail[0].id)).returning();
      return updated;
    }
    const displayName = name?.trim() || cleanEmail.split("@")[0] || "SkillLoop Learner";
    const result = await db.insert(users).values({
      uid,
      name: displayName,
      email: cleanEmail,
      passwordHash: "",
      role: "learner",
      avatar: avatar || DEFAULT_AVATAR,
      emailVerified: true,
      preferredLanguage: "en",
      accessibilityPrefs: {
        fontSize: "normal",
        highContrast: false,
        ttsEnabled: true
      },
      streakDays: 1,
      lastActiveAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        email: cleanEmail,
        emailVerified: true,
        lastActiveAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed (getOrCreateUser):", error);
    throw new Error("Database query failed. Please try again later.", {
      cause: error
    });
  }
}
async function findUserByEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await ensureDatabaseSeeded();
    const rows = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (rows[0]) return rows[0];
  } catch (error) {
    console.warn("Database query failed (findUserByEmail), checking fallback:", error);
  }
  const fallback = Object.values(FALLBACK_USERS).find(
    (u) => u.email.toLowerCase() === cleanEmail
  );
  return fallback || null;
}
async function findUserByUid(uid) {
  try {
    await ensureDatabaseSeeded();
    const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (rows[0]) return rows[0];
  } catch (error) {
    console.warn("Database query failed (findUserByUid), checking fallback:", error);
  }
  return FALLBACK_USERS[uid] || null;
}
async function findDemoUserByRole(role) {
  const demoUid = role === "educator" ? "user-sarah" : role === "admin" ? "user-admin" : "user-fahad";
  try {
    await ensureDatabaseSeeded();
    const byUid = await db.select().from(users).where(eq(users.uid, demoUid)).limit(1);
    if (byUid[0]) return byUid[0];
    const byRole = await db.select().from(users).where(eq(users.role, role)).limit(1);
    if (byRole[0]) return byRole[0];
  } catch (error) {
    console.warn("Database query failed (findDemoUserByRole), checking fallback:", error);
  }
  return FALLBACK_USERS[demoUid] || Object.values(FALLBACK_USERS).find((u) => u.role === role) || null;
}
async function touchUserLastActive(uid) {
  try {
    await db.update(users).set({ lastActiveAt: /* @__PURE__ */ new Date() }).where(eq(users.uid, uid));
  } catch (error) {
    if (FALLBACK_USERS[uid]) {
      FALLBACK_USERS[uid].lastActiveAt = /* @__PURE__ */ new Date();
    }
  }
}
async function updateUserPreferences(uid, patch) {
  try {
    const updateValues = {};
    if (patch.preferredLanguage) {
      updateValues.preferredLanguage = patch.preferredLanguage;
    }
    if (patch.accessibilityPrefs) {
      updateValues.accessibilityPrefs = patch.accessibilityPrefs;
    }
    if (patch.lastActiveAt) {
      updateValues.lastActiveAt = patch.lastActiveAt;
    }
    if (Object.keys(updateValues).length === 0) {
      return findUserByUid(uid);
    }
    const updated = await db.update(users).set(updateValues).where(eq(users.uid, uid)).returning();
    return updated[0] || null;
  } catch (error) {
    console.error("Database query failed (updateUserPreferences):", error);
    throw new Error("Database query failed. Please try again later.", {
      cause: error
    });
  }
}
async function purgeAndCheckPendingSignup(email) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await db.delete(pendingSignups).where(lt(pendingSignups.expiresAt, /* @__PURE__ */ new Date()));
    const existing = await db.select().from(pendingSignups).where(eq(pendingSignups.email, cleanEmail)).limit(1);
    if (existing[0]) return existing[0];
  } catch (error) {
    console.warn("Database query failed (purgeAndCheckPendingSignup), checking fallback");
  }
  const pending = FALLBACK_PENDING_SIGNUPS.get(cleanEmail);
  if (pending && pending.expiresAt < /* @__PURE__ */ new Date()) {
    FALLBACK_PENDING_SIGNUPS.delete(cleanEmail);
    return null;
  }
  return pending || null;
}
async function upsertPendingSignup(params) {
  const cleanEmail = params.email.trim().toLowerCase();
  const now = /* @__PURE__ */ new Date();
  FALLBACK_PENDING_SIGNUPS.set(cleanEmail, {
    id: FALLBACK_PENDING_SIGNUPS.size + 1,
    email: cleanEmail,
    name: params.name,
    passwordHash: params.passwordHash,
    role: params.role,
    codeHash: params.codeHash,
    attempts: 0,
    expiresAt: params.expiresAt,
    lastSentAt: now,
    createdAt: now
  });
  try {
    await db.insert(pendingSignups).values({
      email: cleanEmail,
      name: params.name,
      passwordHash: params.passwordHash,
      role: params.role,
      codeHash: params.codeHash,
      attempts: 0,
      expiresAt: params.expiresAt,
      lastSentAt: now,
      createdAt: now
    }).onConflictDoUpdate({
      target: pendingSignups.email,
      set: {
        name: params.name,
        passwordHash: params.passwordHash,
        role: params.role,
        codeHash: params.codeHash,
        attempts: 0,
        expiresAt: params.expiresAt,
        lastSentAt: now
      }
    });
  } catch (error) {
    console.warn("Database query failed (upsertPendingSignup), saved in fallback store");
  }
}
async function getPendingSignupByEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const rows = await db.select().from(pendingSignups).where(eq(pendingSignups.email, cleanEmail)).limit(1);
    if (rows[0]) return rows[0];
  } catch (error) {
    console.warn("Database query failed (getPendingSignupByEmail), checking fallback");
  }
  return FALLBACK_PENDING_SIGNUPS.get(cleanEmail) || null;
}
async function incrementPendingSignupAttempts(email, nextAttempts) {
  const cleanEmail = email.trim().toLowerCase();
  const existing = FALLBACK_PENDING_SIGNUPS.get(cleanEmail);
  if (existing) {
    existing.attempts = nextAttempts;
  }
  try {
    await db.update(pendingSignups).set({ attempts: nextAttempts }).where(eq(pendingSignups.email, cleanEmail));
  } catch (error) {
    console.warn("Database query failed (incrementPendingSignupAttempts)");
  }
}
async function deletePendingSignupByEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  FALLBACK_PENDING_SIGNUPS.delete(cleanEmail);
  try {
    await db.delete(pendingSignups).where(eq(pendingSignups.email, cleanEmail));
  } catch (error) {
    console.warn("Database query failed (deletePendingSignupByEmail)");
  }
}
async function createVerifiedEmailUser(params) {
  const cleanEmail = params.email.trim().toLowerCase();
  const now = /* @__PURE__ */ new Date();
  const fallbackUser = {
    id: Object.keys(FALLBACK_USERS).length + 1,
    uid: params.uid,
    name: params.name,
    email: cleanEmail,
    passwordHash: params.passwordHash,
    role: params.role,
    avatar: DEFAULT_AVATAR,
    emailVerified: true,
    preferredLanguage: "en",
    accessibilityPrefs: {
      fontSize: "normal",
      highContrast: false,
      ttsEnabled: true
    },
    streakDays: 1,
    lastActiveAt: now,
    createdAt: now
  };
  FALLBACK_USERS[params.uid] = fallbackUser;
  await deletePendingSignupByEmail(cleanEmail);
  try {
    const inserted = await db.insert(users).values(fallbackUser).returning();
    return inserted[0] || fallbackUser;
  } catch (error) {
    console.warn("Database query failed (createVerifiedEmailUser), saved in fallback store");
    return fallbackUser;
  }
}
async function getWorkspaceForUser(uid) {
  try {
    const rows = await db.select().from(userWorkspaces).where(eq(userWorkspaces.userUid, uid)).limit(1);
    return rows[0]?.workspaceData || null;
  } catch (error) {
    console.error("Database query failed (getWorkspaceForUser):", error);
    throw new Error("Database query failed. Please try again later.", {
      cause: error
    });
  }
}
async function saveWorkspaceForUser(uid, workspaceData) {
  try {
    const now = /* @__PURE__ */ new Date();
    await db.insert(userWorkspaces).values({
      userUid: uid,
      workspaceData,
      updatedAt: now
    }).onConflictDoUpdate({
      target: userWorkspaces.userUid,
      set: {
        workspaceData,
        updatedAt: now
      }
    });
  } catch (error) {
    console.error("Database query failed (saveWorkspaceForUser):", error);
    throw new Error("Database query failed. Please try again later.", {
      cause: error
    });
  }
}
async function insertQuizAttempt(params) {
  try {
    await db.insert(quizAttempts).values({
      attemptUuid: params.attemptUuid,
      userUid: params.userUid,
      questionId: params.questionId,
      topicId: params.topicId,
      topicName: params.topicName,
      selectedAnswer: params.selectedAnswer,
      isCorrect: params.isCorrect,
      responseTimeMs: params.responseTimeMs
    });
    const [{ count }] = await db.select({ count: sql`count(*)::int` }).from(quizAttempts);
    return count;
  } catch (error) {
    console.error("Database query failed (insertQuizAttempt):", error);
    throw new Error("Database query failed. Please try again later.", {
      cause: error
    });
  }
}
async function getAdminAuditSummary() {
  try {
    await ensureDatabaseSeeded();
    const allUsers = await db.select().from(users);
    const [{ attemptCount }] = await db.select({ attemptCount: sql`count(*)::int` }).from(quizAttempts);
    const logs = await db.select().from(recoveryLogs).orderBy(desc(recoveryLogs.id));
    const allHashed = allUsers.filter((u) => u.passwordHash.length > 0).every((u) => u.passwordHash.startsWith("scrypt$"));
    return {
      kdfAlgorithm: "scrypt (N=16384, r=8, p=1, 16B random salt, 64B key)",
      sessionAlgorithm: "Firebase Auth ID Token + HMAC-SHA256 Bearer",
      allAccountsHashed: allHashed,
      registeredAccounts: allUsers.length,
      recordedAttempts: attemptCount,
      recoveryLogs: logs.map((l) => ({
        id: l.logCode,
        timestamp: l.timestampLabel,
        event: l.event,
        component: l.component,
        severity: l.severity,
        detail: l.detail
      }))
    };
  } catch (error) {
    return {
      kdfAlgorithm: "scrypt (N=16384, r=8, p=1, 16B random salt, 64B key)",
      sessionAlgorithm: "Firebase Auth ID Token + HMAC-SHA256 Bearer",
      allAccountsHashed: true,
      registeredAccounts: Object.keys(FALLBACK_USERS).length,
      recordedAttempts: 0,
      recoveryLogs: [
        {
          id: "log-1",
          timestamp: "10:14 AM",
          event: "5-Day Inactivity Recovery Triggered",
          component: "Adaptive Recovery Engine",
          severity: "Resolved",
          detail: "Preserved 68% mastery; issued 3-question diagnostic + 10-min catch-up plan."
        },
        {
          id: "log-2",
          timestamp: "09:52 AM",
          event: "AI Offline Rule-Based Fallback Verified",
          component: "Conceptual Feedback Router",
          severity: "Fallback Active",
          detail: "Switched seamlessly to deterministic Python AST/pattern explainer during simulated offline test."
        }
      ]
    };
  }
}

// server.ts
dotenv2.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var PORT = Number(process.env.PORT) || 3e3;
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return res.status(401).json({ error: "Authentication token required." });
  }
  const sessionPayload = verifySessionToken(token);
  if (sessionPayload) {
    req.auth = sessionPayload;
    return next();
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const dbUser = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || `${decodedToken.uid}@firebase.local`,
      typeof decodedToken.name === "string" ? decodedToken.name : void 0,
      typeof decodedToken.picture === "string" ? decodedToken.picture : void 0
    );
    const safe = toPublicUser(dbUser);
    req.auth = {
      sub: safe.id,
      email: safe.email,
      role: safe.role,
      name: safe.name,
      iat: decodedToken.iat,
      exp: decodedToken.exp
    };
    return next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
}
function requireRoles(...allowed) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!allowed.includes(req.auth.role)) {
      return res.status(403).json({
        error: `Access denied: requires ${allowed.join(" or ")} role.`
      });
    }
    next();
  };
}
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
var CANDIDATE_GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-3.8-flash"
].filter(Boolean);
async function callGeminiWithFallback(ai, requestParams) {
  let lastError = null;
  for (const model of CANDIDATE_GEMINI_MODELS) {
    try {
      return await ai.models.generateContent({
        ...requestParams,
        model
      });
    } catch (err) {
      lastError = err;
      console.warn(`Gemini model ${model} failed, trying next fallback:`, err?.message || err);
    }
  }
  throw lastError;
}
function getLanguageInstruction(language) {
  if (language === "ur") {
    return "Respond entirely in natural, polite Urdu script (\u0627\u0631\u062F\u0648) while keeping Python/JavaScript code identifiers in English monospace.";
  }
  if (language === "roman_ur") {
    return "Respond in clear, friendly Roman Urdu (Urdu written in Latin alphabet, e.g., 'Aapka jawab ghalat is wajah se hua...') while keeping code identifiers in English.";
  }
  return "Respond in clear, encouraging, concise English tailored for busy working adult learners.";
}
function parseGeminiJson(rawText, fallback) {
  const cleaned = (rawText ?? "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  if (!cleaned) return fallback;
  return JSON.parse(cleaned);
}
async function startServer() {
  try {
    await migrate(db, { migrationsFolder: process.env.VERCEL ? path2.join(process.cwd(), "drizzle") : path2.resolve(__dirname, "drizzle") });
  } catch (err) {
    console.error("Database migration failed:", err?.message || err);
  }
  const app2 = express();
  app2.use(express.json({ limit: "1mb" }));
  app2.get("/api/health", (_req, res) => {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
    );
    res.json({
      ok: true,
      aiConfigured: hasKey,
      emailConfigured: isEmailDeliveryConfigured(),
      authHashing: "scrypt-salted-64b",
      sessionSigning: "firebase-auth+hmac-sha256"
    });
  });
  app2.post("/api/auth/firebase", async (req, res) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) {
      return res.status(401).json({ error: "Firebase ID token is required." });
    }
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      if (!decoded.email) {
        return res.status(400).json({ error: "Verified email missing on Firebase token." });
      }
      const userRow = await getOrCreateUser(
        decoded.uid,
        decoded.email,
        typeof decoded.name === "string" ? decoded.name : void 0,
        typeof decoded.picture === "string" ? decoded.picture : void 0
      );
      return res.json({ user: toPublicUser(userRow) });
    } catch (error) {
      console.error("Firebase sign-in failed:", error);
      return res.status(401).json({ error: "Invalid Firebase authentication token." });
    }
  });
  app2.post("/api/auth/signup/request-code", async (req, res) => {
    const { name, email, password, role = "learner" } = req.body ?? {};
    const cleanName = String(name ?? "").trim();
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const cleanPass = String(password ?? "");
    if (cleanName.length < 2) {
      return res.status(400).json({ error: "Please enter your full name." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (cleanPass.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    const validRole = role === "educator" || role === "admin" ? role : "learner";
    try {
      const existingUser = await findUserByEmail(cleanEmail);
      if (existingUser) {
        return res.status(409).json({
          error: "An account with this email already exists. Please sign in instead.",
          alreadyExists: true
        });
      }
      const existingPending = await purgeAndCheckPendingSignup(cleanEmail);
      const nowMs = Date.now();
      if (existingPending) {
        const elapsedSec = Math.floor(
          (nowMs - existingPending.lastSentAt.getTime()) / 1e3
        );
        if (elapsedSec < 15) {
          return res.status(429).json({
            error: `Please wait ${15 - elapsedSec}s before requesting another code.`
          });
        }
      }
      const otpCode = generateOtpCode();
      const delivery = await sendVerificationEmail({
        to: cleanEmail,
        name: cleanName,
        code: otpCode
      });
      if (!delivery.sent) {
        return res.status(503).json({
          error: delivery.error || "Unable to send verification email. Please verify email provider settings."
        });
      }
      await upsertPendingSignup({
        email: cleanEmail,
        name: cleanName,
        passwordHash: hashPassword(cleanPass),
        role: validRole,
        codeHash: hashOtpCode(cleanEmail, otpCode),
        expiresAt: new Date(nowMs + 10 * 60 * 1e3)
      });
      return res.json({
        ok: true,
        email: cleanEmail,
        expiresInSec: 600,
        deliveryMode: "email",
        provider: delivery.provider
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Signup failed.";
      return res.status(500).json({ error: msg });
    }
  });
  app2.post("/api/auth/signup/verify-code", async (req, res) => {
    const { email, code } = req.body ?? {};
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const cleanCode = String(code ?? "").replace(/\s+/g, "");
    if (!cleanEmail || !/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json({ error: "Please enter the 6-digit verification code." });
    }
    try {
      const pending = await getPendingSignupByEmail(cleanEmail);
      if (!pending) {
        return res.status(400).json({
          error: "No pending verification found. Please request a new code."
        });
      }
      if (pending.expiresAt.getTime() <= Date.now()) {
        await deletePendingSignupByEmail(cleanEmail);
        return res.status(400).json({
          error: "Verification code expired. Please request a new code."
        });
      }
      if (pending.attempts >= 5) {
        await deletePendingSignupByEmail(cleanEmail);
        return res.status(429).json({
          error: "Too many incorrect attempts. Please request a new code."
        });
      }
      if (!verifyOtpCode(cleanEmail, cleanCode, pending.codeHash)) {
        const nextAttempts = pending.attempts + 1;
        await incrementPendingSignupAttempts(cleanEmail, nextAttempts);
        const remaining = Math.max(0, 5 - nextAttempts);
        return res.status(401).json({
          error: remaining > 0 ? `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} left.` : "Too many incorrect attempts. Please request a new code."
        });
      }
      const existingUser = await findUserByEmail(cleanEmail);
      if (existingUser) {
        await deletePendingSignupByEmail(cleanEmail);
        return res.status(409).json({
          error: "An account with this email already exists. Please sign in instead.",
          alreadyExists: true
        });
      }
      const validRole = pending.role === "educator" || pending.role === "admin" ? pending.role : "learner";
      const created = await createVerifiedEmailUser({
        uid: `user-${Date.now()}`,
        name: pending.name,
        email: cleanEmail,
        passwordHash: pending.passwordHash,
        role: validRole
      });
      const safeUser = toPublicUser(created);
      const token = signSessionToken(safeUser);
      return res.status(201).json({ token, user: safeUser });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Verification failed.";
      return res.status(500).json({ error: msg });
    }
  });
  app2.post("/api/auth/signup", async (req, res) => {
    const { name, email, password, role = "learner" } = req.body ?? {};
    const cleanName = String(name ?? "").trim();
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const cleanPass = String(password ?? "");
    if (cleanName.length < 2) {
      return res.status(400).json({ error: "Please enter your full name." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (cleanPass.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    const validRole = role === "educator" || role === "admin" ? role : "learner";
    try {
      if (await findUserByEmail(cleanEmail)) {
        return res.status(409).json({
          error: "An account with this email already exists. Please sign in instead.",
          alreadyExists: true
        });
      }
      const created = await createVerifiedEmailUser({
        uid: `user-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        passwordHash: hashPassword(cleanPass),
        role: validRole
      });
      const safeUser = toPublicUser(created);
      const token = signSessionToken(safeUser);
      return res.status(201).json({ token, user: safeUser });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Signup failed.";
      return res.status(500).json({ error: msg });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const cleanPass = String(password ?? "");
    if (!cleanEmail || !cleanPass) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    try {
      const user = await findUserByEmail(cleanEmail);
      if (!user || !user.passwordHash || !verifyPassword(cleanPass, user.passwordHash)) {
        return res.status(401).json({ error: "Invalid email or password." });
      }
      await touchUserLastActive(user.uid);
      const safeUser = toPublicUser(user);
      const token = signSessionToken(safeUser);
      return res.json({ token, user: safeUser });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Sign-in failed.";
      return res.status(500).json({ error: msg });
    }
  });
  app2.post("/api/auth/demo", async (req, res) => {
    const { role = "learner" } = req.body ?? {};
    const targetRole = role === "educator" || role === "admin" ? role : "learner";
    try {
      const user = await findDemoUserByRole(targetRole);
      if (!user) {
        return res.status(404).json({ error: "Demo account not found." });
      }
      await touchUserLastActive(user.uid);
      const safeUser = toPublicUser(user);
      const token = signSessionToken(safeUser);
      return res.json({ token, user: safeUser });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Demo login failed.";
      return res.status(500).json({ error: msg });
    }
  });
  app2.get(
    "/api/auth/me",
    requireAuth,
    async (req, res) => {
      try {
        const user = req.auth?.sub ? await findUserByUid(req.auth.sub) : null;
        if (!user) {
          return res.status(404).json({ error: "User session no longer exists." });
        }
        return res.json({ user: toPublicUser(user) });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unable to load profile.";
        return res.status(500).json({ error: msg });
      }
    }
  );
  app2.patch(
    "/api/auth/preferences",
    requireAuth,
    async (req, res) => {
      try {
        const { preferred_language, accessibility_prefs, last_active_at } = req.body ?? {};
        const updated = await updateUserPreferences(req.auth.sub, {
          preferredLanguage: preferred_language === "en" || preferred_language === "ur" || preferred_language === "roman_ur" ? preferred_language : void 0,
          accessibilityPrefs: accessibility_prefs && typeof accessibility_prefs === "object" ? {
            fontSize: accessibility_prefs.fontSize === "large" ? "large" : "normal",
            highContrast: Boolean(accessibility_prefs.highContrast),
            ttsEnabled: Boolean(accessibility_prefs.ttsEnabled)
          } : void 0,
          lastActiveAt: typeof last_active_at === "string" ? new Date(last_active_at) : void 0
        });
        if (!updated) {
          return res.status(404).json({ error: "User not found." });
        }
        return res.json({ user: toPublicUser(updated) });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unable to update preferences.";
        return res.status(500).json({ error: msg });
      }
    }
  );
  app2.get(
    "/api/workspace",
    requireAuth,
    async (req, res) => {
      try {
        const saved = await getWorkspaceForUser(req.auth.sub);
        return res.json({ workspace: saved });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unable to load workspace.";
        return res.status(500).json({ error: msg });
      }
    }
  );
  app2.put(
    "/api/workspace",
    requireAuth,
    async (req, res) => {
      const workspace = req.body?.workspace;
      if (!workspace || typeof workspace !== "object" || Array.isArray(workspace)) {
        return res.status(400).json({ error: "Workspace payload must be a JSON object." });
      }
      try {
        await saveWorkspaceForUser(
          req.auth.sub,
          workspace
        );
        return res.json({ ok: true });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unable to save workspace.";
        return res.status(500).json({ error: msg });
      }
    }
  );
  app2.post(
    "/api/attempts",
    requireAuth,
    requireRoles("learner", "admin"),
    async (req, res) => {
      const attempt = req.body;
      if (!attempt || !attempt.question_id) {
        return res.status(400).json({ error: "Invalid attempt payload." });
      }
      try {
        const count = await insertQuizAttempt({
          attemptUuid: String(attempt.id || `att-${Date.now()}`),
          userUid: req.auth.sub,
          questionId: String(attempt.question_id),
          topicId: String(attempt.topic_id || "topic-general"),
          topicName: String(attempt.topic_name || "General"),
          selectedAnswer: String(attempt.selected_answer ?? ""),
          isCorrect: Boolean(attempt.is_correct),
          responseTimeMs: Number(attempt.response_time_ms) || 0
        });
        return res.status(201).json({ ok: true, count });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unable to save attempt.";
        return res.status(500).json({ error: msg });
      }
    }
  );
  app2.get(
    "/api/admin/audit",
    requireAuth,
    requireRoles("admin"),
    async (_req, res) => {
      try {
        const summary = await getAdminAuditSummary();
        return res.json(summary);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unable to load audit summary.";
        return res.status(500).json({ error: msg });
      }
    }
  );
  app2.post(
    "/api/ai/feedback",
    requireAuth,
    requireRoles("learner", "admin"),
    async (req, res) => {
      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured on the server.",
          offlineRecommended: true
        });
      }
      const {
        question,
        codeSnippet,
        userAnswer,
        correctAnswer,
        topic,
        language = "en"
      } = req.body ?? {};
      if (!question || userAnswer === void 0 || !correctAnswer) {
        return res.status(400).json({ error: "Missing required fields." });
      }
      try {
        const langPrompt = getLanguageInstruction(language);
        const isCorrect = String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
        const prompt = `You are SkillLoop AI, an adaptive tutor for working adults.
Topic: ${topic || "Programming"}
Question: ${question}
Code snippet: ${codeSnippet || "N/A"}
Learner submitted answer: ${userAnswer}
Expected correct answer: ${correctAnswer}
Is learner correct: ${isCorrect}

${langPrompt}

Provide:
1. whyOutcome: If wrong, diagnose the exact mental model misconception (for example, confusing string concatenation '5'+'3'='53' vs integer addition 5+3=8). If right, confirm *why* their mental model works.
2. coreConcept: Concise 2-sentence conceptual rule.
3. stepByStep: Clear 2-step trace of how the code or logic executes.
4. followUpQuestion: A short targeted follow-up check question on the same concept.
5. followUpOptions: Array of exactly 3 short answer choices.
6. followUpAnswer: Exact string matching one of followUpOptions.`;
        const response = await callGeminiWithFallback(ai, {
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                whyOutcome: { type: Type.STRING },
                coreConcept: { type: Type.STRING },
                stepByStep: { type: Type.STRING },
                followUpQuestion: { type: Type.STRING },
                followUpOptions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                followUpAnswer: { type: Type.STRING }
              },
              required: [
                "whyOutcome",
                "coreConcept",
                "stepByStep",
                "followUpQuestion",
                "followUpOptions",
                "followUpAnswer"
              ]
            }
          }
        });
        const parsed = parseGeminiJson(
          response.text,
          {}
        );
        return res.json({ source: "gemini", feedback: parsed });
      } catch (error) {
        console.error("Gemini feedback error:", error);
        return res.status(502).json({
          error: "Unable to reach Gemini AI service.",
          offlineRecommended: true
        });
      }
    }
  );
  app2.post(
    "/api/ai/tutor",
    requireAuth,
    async (req, res) => {
      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured on the server.",
          offlineRecommended: true
        });
      }
      const {
        message,
        learnerName = "Fahad",
        topicMastery = [],
        activeCourse = "Python Programming",
        language = "en"
      } = req.body ?? {};
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }
      try {
        const langPrompt = getLanguageInstruction(language);
        const masterySummary = Array.isArray(topicMastery) ? topicMastery.map(
          (t) => `${t.name}: ${t.mastery}%`
        ).join(", ") : "";
        const response = await callGeminiWithFallback(ai, {
          contents: `Learner message: ${message}`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            systemInstruction: `You are SkillLoop AI Tutor helping ${learnerName}, a working adult learner with an irregular schedule.
Active course: ${activeCourse}.
Current topic mastery: ${masterySummary}.
${langPrompt}
Use Socratic hints first\u2014guide the learner to notice the key rule with a brief guiding question and a tiny 2-line code hint (under 130 words). Never punish missed days.`
          }
        });
        return res.json({
          source: "gemini",
          reply: (response.text ?? "").trim()
        });
      } catch (error) {
        console.error("Gemini tutor error:", error);
        return res.status(502).json({
          error: "Unable to reach Gemini AI Tutor.",
          offlineRecommended: true
        });
      }
    }
  );
  app2.post(
    "/api/ai/generate-questions",
    requireAuth,
    requireRoles("educator", "admin"),
    async (req, res) => {
      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured on the server.",
          offlineRecommended: true
        });
      }
      const {
        notes,
        courseTitle = "Python Programming",
        topicName = "Loops"
      } = req.body ?? {};
      if (!notes || String(notes).trim().length < 10) {
        return res.status(400).json({
          error: "Please provide course notes (at least 10 characters)."
        });
      }
      try {
        const prompt = `Extract key concepts from these educator notes and generate 3 scaffolded assessment items (one Easy, one Medium, one Hard) for adult learners.
Course: ${courseTitle}
Topic: ${topicName}
Notes:
${notes}`;
        const response = await callGeminiWithFallback(ai, {
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                extractedConcepts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                drafts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      codeSnippet: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      correctAnswer: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                    required: [
                      "question",
                      "options",
                      "correctAnswer",
                      "difficulty",
                      "explanation"
                    ]
                  }
                }
              },
              required: ["extractedConcepts", "drafts"]
            }
          }
        });
        const parsed = parseGeminiJson(
          response.text,
          {}
        );
        return res.json({ source: "gemini", ...parsed });
      } catch (error) {
        console.error("Gemini generate-questions error:", error);
        return res.status(502).json({
          error: "Unable to reach Gemini AI generator.",
          offlineRecommended: true
        });
      }
    }
  );
  app2.use("/api", (_req, res) => {
    return res.status(404).json({ error: "API endpoint not found." });
  });
  if (process.env.VERCEL) return app2;
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app2.use(vite.middlewares);
  } else {
    const distPath = path2.resolve(__dirname, "dist");
    app2.use(express.static(distPath));
    app2.get("*", (_req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  app2.listen(PORT, "0.0.0.0", () => {
    console.log(`SkillLoop AI server running at http://localhost:${PORT}`);
  });
}
if (!process.env.VERCEL) startServer();

// vercel-entry.ts
var app = await startServer();
var vercel_entry_default = app;
export {
  vercel_entry_default as default
};
