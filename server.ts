import express from "express";
import type { NextFunction, Request, Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import {
  generateOtpCode,
  hashOtpCode,
  hashPassword,
  isEmailDeliveryConfigured,
  sendVerificationEmail,
  signSessionToken,
  verifyOtpCode,
  verifyPassword,
  verifySessionToken,
} from "./server/authAndStore.ts";
import type { Role, TokenPayload } from "./server/authAndStore.ts";
import { adminAuth } from "./src/lib/firebase-admin.ts";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./src/db/index.ts";
import {
  createVerifiedEmailUser,
  deletePendingSignupByEmail,
  findDemoUserByRole,
  findUserByEmail,
  findUserByUid,
  getAdminAuditSummary,
  getOrCreateUser,
  getPendingSignupByEmail,
  getWorkspaceForUser,
  incrementPendingSignupAttempts,
  insertQuizAttempt,
  purgeAndCheckPendingSignup,
  saveWorkspaceForUser,
  toPublicUser,
  touchUserLastActive,
  updateUserPreferences,
  upsertPendingSignup,
} from "./src/db/users.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface AuthenticatedRequest extends Request {
  auth?: TokenPayload;
}

async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return res.status(401).json({ error: "Authentication token required." });
  }

  // 1. Check signed session Bearer token (Email/OTP/Demo)
  const sessionPayload = verifySessionToken(token);
  if (sessionPayload) {
    req.auth = sessionPayload;
    return next();
  }

  // 2. Check Firebase Auth ID token (Google Sign-In)
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const dbUser = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || `${decodedToken.uid}@firebase.local`,
      typeof decodedToken.name === "string" ? decodedToken.name : undefined,
      typeof decodedToken.picture === "string" ? decodedToken.picture : undefined
    );
    const safe = toPublicUser(dbUser);
    req.auth = {
      sub: safe.id,
      email: safe.email,
      role: safe.role,
      name: safe.name,
      iat: decodedToken.iat,
      exp: decodedToken.exp,
    };
    return next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
}

function requireRoles(...allowed: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!allowed.includes(req.auth.role)) {
      return res.status(403).json({
        error: `Access denied: requires ${allowed.join(" or ")} role.`,
      });
    }
    next();
  };
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const CANDIDATE_GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-3.8-flash",
].filter(Boolean) as string[];

async function callGeminiWithFallback(ai: GoogleGenAI, requestParams: Record<string, unknown>) {
  let lastError: unknown = null;
  for (const model of CANDIDATE_GEMINI_MODELS) {
    try {
      return await ai.models.generateContent({
        ...requestParams,
        model,
      } as any);
    } catch (err) {
      lastError = err;
      console.warn(`Gemini model ${model} failed, trying next fallback:`, (err as Error)?.message || err);
    }
  }
  throw lastError;
}

function getLanguageInstruction(language: string): string {
  if (language === "ur") {
    return "Respond entirely in natural, polite Urdu script (اردو) while keeping Python/JavaScript code identifiers in English monospace.";
  }
  if (language === "roman_ur") {
    return "Respond in clear, friendly Roman Urdu (Urdu written in Latin alphabet, e.g., 'Aapka jawab ghalat is wajah se hua...') while keeping code identifiers in English.";
  }
  return "Respond in clear, encouraging, concise English tailored for busy working adult learners.";
}

function parseGeminiJson<T>(rawText: string | undefined, fallback: T): T {
  const cleaned = (rawText ?? "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (!cleaned) return fallback;
  return JSON.parse(cleaned) as T;
}

export async function startServer() {
  // Create tables on a fresh database (e.g. new Railway Postgres); no-op once applied.
  try {
    await migrate(db, { migrationsFolder: process.env.VERCEL ? path.join(process.cwd(), "drizzle") : path.resolve(__dirname, "drizzle") });
  } catch (err) {
    console.error("Database migration failed:", (err as Error)?.message || err);
  }

  const app = express();
  app.use(express.json({ limit: "1mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
    );
    res.json({
      ok: true,
      aiConfigured: hasKey,
      emailConfigured: isEmailDeliveryConfigured(),
      authHashing: "scrypt-salted-64b",
      sessionSigning: "firebase-auth+hmac-sha256",
    });
  });

  // ---------------- AUTHENTICATION, EMAIL OTP & CLOUD SQL ROUTES ----------------

  app.post("/api/auth/firebase", async (req, res) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) {
      return res.status(401).json({ error: "Firebase ID token is required." });
    }
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      if (!decoded.email) {
        return res
          .status(400)
          .json({ error: "Verified email missing on Firebase token." });
      }
      const userRow = await getOrCreateUser(
        decoded.uid,
        decoded.email,
        typeof decoded.name === "string" ? decoded.name : undefined,
        typeof decoded.picture === "string" ? decoded.picture : undefined
      );
      return res.json({ user: toPublicUser(userRow) });
    } catch (error) {
      console.error("Firebase sign-in failed:", error);
      return res
        .status(401)
        .json({ error: "Invalid Firebase authentication token." });
    }
  });

  app.post("/api/auth/signup/request-code", async (req, res) => {
    const { name, email, password, role = "learner" } = req.body ?? {};
    const cleanName = String(name ?? "").trim();
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const cleanPass = String(password ?? "");

    if (cleanName.length < 2) {
      return res.status(400).json({ error: "Please enter your full name." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address." });
    }
    if (cleanPass.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    // Public signup can't self-assign admin.
    const validRole: Role = role === "educator" ? "educator" : "learner";

    try {
      const existingUser = await findUserByEmail(cleanEmail);
      if (existingUser) {
        return res
          .status(409)
          .json({
            error: "An account with this email already exists. Please sign in instead.",
            alreadyExists: true,
          });
      }

      const existingPending = await purgeAndCheckPendingSignup(cleanEmail);
      const nowMs = Date.now();
      if (existingPending) {
        const elapsedSec = Math.floor(
          (nowMs - existingPending.lastSentAt.getTime()) / 1000
        );
        if (elapsedSec < 15) {
          return res.status(429).json({
            error: `Please wait ${15 - elapsedSec}s before requesting another code.`,
          });
        }
      }

      const otpCode = generateOtpCode();
      const delivery = await sendVerificationEmail({
        to: cleanEmail,
        name: cleanName,
        code: otpCode,
      });

      if (!delivery.sent) {
        return res.status(503).json({
          error:
            delivery.error ||
            "Unable to send verification email. Please verify email provider settings.",
        });
      }

      await upsertPendingSignup({
        email: cleanEmail,
        name: cleanName,
        passwordHash: hashPassword(cleanPass),
        role: validRole,
        codeHash: hashOtpCode(cleanEmail, otpCode),
        expiresAt: new Date(nowMs + 10 * 60 * 1000),
      });

      return res.json({
        ok: true,
        email: cleanEmail,
        expiresInSec: 600,
        deliveryMode: "email",
        provider: delivery.provider,
      });
    } catch (error) {
      // pg connection failures can have an empty message (AggregateError); fall back to the code.
      const msg =
        (error instanceof Error && (error.message || (error as NodeJS.ErrnoException).code)) ||
        "Signup failed (database unreachable - check DATABASE_URL).";
      return res.status(500).json({ error: msg });
    }
  });

  app.post("/api/auth/signup/verify-code", async (req, res) => {
    const { email, code } = req.body ?? {};
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const cleanCode = String(code ?? "").replace(/\s+/g, "");

    if (!cleanEmail || !/^\d{6}$/.test(cleanCode)) {
      return res
        .status(400)
        .json({ error: "Please enter the 6-digit verification code." });
    }

    try {
      const pending = await getPendingSignupByEmail(cleanEmail);
      if (!pending) {
        return res.status(400).json({
          error: "No pending verification found. Please request a new code.",
        });
      }

      if (pending.expiresAt.getTime() <= Date.now()) {
        await deletePendingSignupByEmail(cleanEmail);
        return res.status(400).json({
          error: "Verification code expired. Please request a new code.",
        });
      }

      if (pending.attempts >= 5) {
        await deletePendingSignupByEmail(cleanEmail);
        return res.status(429).json({
          error: "Too many incorrect attempts. Please request a new code.",
        });
      }

      if (!verifyOtpCode(cleanEmail, cleanCode, pending.codeHash)) {
        const nextAttempts = pending.attempts + 1;
        await incrementPendingSignupAttempts(cleanEmail, nextAttempts);
        const remaining = Math.max(0, 5 - nextAttempts);
        return res.status(401).json({
          error:
            remaining > 0
              ? `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"
              } left.`
              : "Too many incorrect attempts. Please request a new code.",
        });
      }

      const existingUser = await findUserByEmail(cleanEmail);
      if (existingUser) {
        await deletePendingSignupByEmail(cleanEmail);
        return res
          .status(409)
          .json({
            error: "An account with this email already exists. Please sign in instead.",
            alreadyExists: true,
          });
      }

      const validRole: Role =
        pending.role === "educator" || pending.role === "admin"
          ? pending.role
          : "learner";

      const created = await createVerifiedEmailUser({
        uid: `user-${Date.now()}`,
        name: pending.name,
        email: cleanEmail,
        passwordHash: pending.passwordHash,
        role: validRole,
      });

      const safeUser = toPublicUser(created);
      const token = signSessionToken(safeUser);
      return res.status(201).json({ token, user: safeUser });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Verification failed.";
      return res.status(500).json({ error: msg });
    }
  });

  // Direct signup (no email verification) so the app works without an email provider.
  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password, role = "learner" } = req.body ?? {};
    const cleanName = String(name ?? "").trim();
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const cleanPass = String(password ?? "");

    if (cleanName.length < 2) {
      return res.status(400).json({ error: "Please enter your full name." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address." });
    }
    if (cleanPass.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    // Public signup can't self-assign admin.
    const validRole: Role = role === "educator" ? "educator" : "learner";

    try {
      if (await findUserByEmail(cleanEmail)) {
        return res.status(409).json({
          error: "An account with this email already exists. Please sign in instead.",
          alreadyExists: true,
        });
      }
      const created = await createVerifiedEmailUser({
        uid: `user-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        passwordHash: hashPassword(cleanPass),
        role: validRole,
      });
      const safeUser = toPublicUser(created);
      const token = signSessionToken(safeUser);
      return res.status(201).json({ token, user: safeUser });
    } catch (error) {
      // pg connection failures can have an empty message (AggregateError); fall back to the code.
      const msg =
        (error instanceof Error && (error.message || (error as NodeJS.ErrnoException).code)) ||
        "Signup failed (database unreachable - check DATABASE_URL).";
      return res.status(500).json({ error: msg });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const cleanPass = String(password ?? "");

    if (!cleanEmail || !cleanPass) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
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

  app.post("/api/auth/demo", async (req, res) => {
    const { role = "learner" } = req.body ?? {};
    const targetRole: Role =
      role === "educator" || role === "admin" ? role : "learner";

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

  app.get(
    "/api/auth/me",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const user = req.auth?.sub ? await findUserByUid(req.auth.sub) : null;
        if (!user) {
          return res
            .status(404)
            .json({ error: "User session no longer exists." });
        }
        return res.json({ user: toPublicUser(user) });
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Unable to load profile.";
        return res.status(500).json({ error: msg });
      }
    }
  );

  app.patch(
    "/api/auth/preferences",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { preferred_language, accessibility_prefs, last_active_at } =
          req.body ?? {};

        const updated = await updateUserPreferences(req.auth!.sub, {
          preferredLanguage:
            preferred_language === "en" ||
              preferred_language === "ur" ||
              preferred_language === "roman_ur"
              ? preferred_language
              : undefined,
          accessibilityPrefs:
            accessibility_prefs && typeof accessibility_prefs === "object"
              ? {
                fontSize:
                  accessibility_prefs.fontSize === "large"
                    ? "large"
                    : "normal",
                highContrast: Boolean(accessibility_prefs.highContrast),
                ttsEnabled: Boolean(accessibility_prefs.ttsEnabled),
              }
              : undefined,
          lastActiveAt:
            typeof last_active_at === "string"
              ? new Date(last_active_at)
              : undefined,
        });

        if (!updated) {
          return res.status(404).json({ error: "User not found." });
        }

        return res.json({ user: toPublicUser(updated) });
      } catch (error) {
        const msg =
          error instanceof Error
            ? error.message
            : "Unable to update preferences.";
        return res.status(500).json({ error: msg });
      }
    }
  );

  // ---------------- WORKSPACE & TELEMETRY PERSISTENCE ----------------

  app.get(
    "/api/workspace",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const saved = await getWorkspaceForUser(req.auth!.sub);
        return res.json({ workspace: saved });
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Unable to load workspace.";
        return res.status(500).json({ error: msg });
      }
    }
  );

  app.put(
    "/api/workspace",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      const workspace = req.body?.workspace;
      if (
        !workspace ||
        typeof workspace !== "object" ||
        Array.isArray(workspace)
      ) {
        return res
          .status(400)
          .json({ error: "Workspace payload must be a JSON object." });
      }
      try {
        await saveWorkspaceForUser(
          req.auth!.sub,
          workspace as Record<string, unknown>
        );
        return res.json({ ok: true });
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Unable to save workspace.";
        return res.status(500).json({ error: msg });
      }
    }
  );

  app.post(
    "/api/attempts",
    requireAuth,
    requireRoles("learner", "admin"),
    async (req: AuthenticatedRequest, res) => {
      const attempt = req.body;
      if (!attempt || !attempt.question_id) {
        return res.status(400).json({ error: "Invalid attempt payload." });
      }
      try {
        const count = await insertQuizAttempt({
          attemptUuid: String(attempt.id || `att-${Date.now()}`),
          userUid: req.auth!.sub,
          questionId: String(attempt.question_id),
          topicId: String(attempt.topic_id || "topic-general"),
          topicName: String(attempt.topic_name || "General"),
          selectedAnswer: String(attempt.selected_answer ?? ""),
          isCorrect: Boolean(attempt.is_correct),
          responseTimeMs: Number(attempt.response_time_ms) || 0,
        });
        return res.status(201).json({ ok: true, count });
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Unable to save attempt.";
        return res.status(500).json({ error: msg });
      }
    }
  );

  app.get(
    "/api/admin/audit",
    requireAuth,
    requireRoles("admin"),
    async (_req: AuthenticatedRequest, res) => {
      try {
        const summary = await getAdminAuditSummary();
        return res.json(summary);
      } catch (error) {
        const msg =
          error instanceof Error
            ? error.message
            : "Unable to load audit summary.";
        return res.status(500).json({ error: msg });
      }
    }
  );

  // ---------------- GEMINI AI ROUTES ----------------

  // 1. AI Conceptual Feedback Endpoint (Authenticated Learners & Admins)
  app.post(
    "/api/ai/feedback",
    requireAuth,
    requireRoles("learner", "admin"),
    async (req: AuthenticatedRequest, res) => {
      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured on the server.",
          offlineRecommended: true,
        });
      }

      const {
        question,
        codeSnippet,
        userAnswer,
        correctAnswer,
        topic,
        language = "en",
      } = req.body ?? {};

      if (!question || userAnswer === undefined || !correctAnswer) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      try {
        const langPrompt = getLanguageInstruction(language);
        const isCorrect =
          String(userAnswer).trim().toLowerCase() ===
          String(correctAnswer).trim().toLowerCase();

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
                  items: { type: Type.STRING },
                },
                followUpAnswer: { type: Type.STRING },
              },
              required: [
                "whyOutcome",
                "coreConcept",
                "stepByStep",
                "followUpQuestion",
                "followUpOptions",
                "followUpAnswer",
              ],
            },
          },
        });

        const parsed = parseGeminiJson<Record<string, unknown>>(
          response.text,
          {}
        );
        return res.json({ source: "gemini", feedback: parsed });
      } catch (error) {
        console.error("Gemini feedback error:", error);
        return res.status(502).json({
          error: "Unable to reach Gemini AI service.",
          offlineRecommended: true,
        });
      }
    });

  // 2. AI Tutor Chat Endpoint (Authenticated Users)
  app.post(
    "/api/ai/tutor",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured on the server.",
          offlineRecommended: true,
        });
      }

      const {
        message,
        learnerName = "Fahad",
        topicMastery = [],
        activeCourse = "Python Programming",
        language = "en",
      } = req.body ?? {};

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      try {
        const langPrompt = getLanguageInstruction(language);
        const masterySummary = Array.isArray(topicMastery)
          ? topicMastery
            .map(
              (t: { name: string; mastery: number }) =>
                `${t.name}: ${t.mastery}%`
            )
            .join(", ")
          : "";

        const response = await callGeminiWithFallback(ai, {
          contents: `Learner message: ${message}`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            systemInstruction: `You are SkillLoop AI Tutor helping ${learnerName}, a working adult learner with an irregular schedule.
Active course: ${activeCourse}.
Current topic mastery: ${masterySummary}.
${langPrompt}
Use Socratic hints first—guide the learner to notice the key rule with a brief guiding question and a tiny 2-line code hint (under 130 words). Never punish missed days.`,
          },
        });

        return res.json({
          source: "gemini",
          reply: (response.text ?? "").trim(),
        });
      } catch (error) {
        console.error("Gemini tutor error:", error);
        return res.status(502).json({
          error: "Unable to reach Gemini AI Tutor.",
          offlineRecommended: true,
        });
      }
    }
  );

  // 3. Educator AI Content Generator Endpoint (Educator & Admin Only)
  app.post(
    "/api/ai/generate-questions",
    requireAuth,
    requireRoles("educator", "admin"),
    async (req: AuthenticatedRequest, res) => {
      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured on the server.",
          offlineRecommended: true,
        });
      }

      const {
        notes,
        courseTitle = "Python Programming",
        topicName = "Loops",
      } = req.body ?? {};

      if (!notes || String(notes).trim().length < 10) {
        return res.status(400).json({
          error: "Please provide course notes (at least 10 characters).",
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
                  items: { type: Type.STRING },
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
                        items: { type: Type.STRING },
                      },
                      correctAnswer: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                    },
                    required: [
                      "question",
                      "options",
                      "correctAnswer",
                      "difficulty",
                      "explanation",
                    ],
                  },
                },
              },
              required: ["extractedConcepts", "drafts"],
            },
          },
        });

        const parsed = parseGeminiJson<Record<string, unknown>>(
          response.text,
          {}
        );
        return res.json({ source: "gemini", ...parsed });
      } catch (error) {
        console.error("Gemini generate-questions error:", error);
        return res.status(502).json({
          error: "Unable to reach Gemini AI generator.",
          offlineRecommended: true,
        });
      }
    });

  // Unmatched /api routes should always return JSON 404 rather than falling through to SPA HTML
  app.use("/api", (_req, res) => {
    return res.status(404).json({ error: "API endpoint not found." });
  });

  // On Vercel the static build is served by the CDN; the function only handles /api.
  if (process.env.VERCEL) return app;

  // Vite middleware in dev, static dist in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SkillLoop AI server running at http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) startServer();
