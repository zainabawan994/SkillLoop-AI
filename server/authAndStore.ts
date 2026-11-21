import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import nodemailer from "nodemailer";

export type Role = "learner" | "educator" | "admin";
export type Language = "en" | "ur" | "roman_ur";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  avatar: string;
  email_verified?: boolean;
  preferred_language: Language;
  accessibility_prefs: {
    fontSize: "normal" | "large";
    highContrast: boolean;
    ttsEnabled: boolean;
  };
  streak_days: number;
  last_active_at: string;
  created_at: string;
}

export type PublicUser = Omit<StoredUser, "passwordHash">;

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
  iat: number;
  exp: number;
}

export interface PendingSignupOtp {
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  codeHash: string;
  attempts: number;
  expiresAt: string;
  lastSentAt: string;
  createdAt: string;
}

function resolveDataDir(): string {
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

const DATA_DIR = resolveDataDir();
const SECRET_PATH = path.join(DATA_DIR, "session-secret.key");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  ensureDataDir();
  if (fs.existsSync(SECRET_PATH)) {
    const existing = fs.readFileSync(SECRET_PATH, "utf8").trim();
    if (existing.length >= 32) return existing;
  }
  const generated = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(SECRET_PATH, generated, { mode: 0o600 });
  return generated;
}

// Per-user salted scrypt password hashing (Node built-in crypto, memory-hard KDF)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
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
      p: 1,
    });
    if (expected.length !== actual.length) return false;
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// Cryptographic 6-digit OTP generation and HMAC-SHA256 verification
export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtpCode(email: string, code: string): string {
  const secret = getSessionSecret();
  return crypto
    .createHmac("sha256", secret)
    .update(`${email.toLowerCase()}:${code.trim()}`)
    .digest("hex");
}

export function verifyOtpCode(
  email: string,
  submittedCode: string,
  storedHash: string
): boolean {
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

export interface EmailSendResult {
  sent: boolean;
  provider?: string;
  error?: string;
}

export function getConfiguredSecret(val?: string): string | null {
  const trimmed = val?.trim();
  if (!trimmed) return null;
  if (/^(MY_|YOUR_|CHANGE_ME|REPLACE_|EXAMPLE|<)/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function isEmailDeliveryConfigured(): boolean {
  return Boolean(
    getConfiguredSecret(process.env.RESEND_API_KEY) ||
      getConfiguredSecret(process.env.SENDGRID_API_KEY) ||
      getConfiguredSecret(process.env.BREVO_API_KEY) ||
      (getConfiguredSecret(process.env.SMTP_USER) &&
        getConfiguredSecret(process.env.SMTP_PASS))
  );
}

function extractSafeProviderMessage(rawBody: string): string {
  try {
    const parsed = JSON.parse(rawBody) as {
      message?: string;
      error?: string | { message?: string };
      errors?: Array<{ message?: string }>;
    };
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message.trim();
    }
    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error.trim();
    }
    if (
      parsed.error &&
      typeof parsed.error === "object" &&
      typeof parsed.error.message === "string"
    ) {
      return parsed.error.message.trim();
    }
    if (Array.isArray(parsed.errors) && parsed.errors[0]?.message) {
      return parsed.errors[0].message.trim();
    }
  } catch {
    // Ignore non-JSON body
  }
  return "";
}

export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  code: string;
}): Promise<EmailSendResult> {
  const { to, name, code } = params;
  const subject = `${code} is your SkillLoop AI verification code`;
  const textBody = `Hi ${name},\n\nWelcome to SkillLoop AI! Enter this 6-digit verification code to activate your account:\n\n${code}\n\nThis code expires in 10 minutes. If you didn't request this, you can safely ignore this email.\n\n— SkillLoop AI`;
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

  const providerErrors: string[] = [];

  // 1. Standard SMTP / Gmail App Password via Nodemailer (best for personal Gmail -> any recipient)
  const smtpUser = getConfiguredSecret(process.env.SMTP_USER);
  const smtpPass = getConfiguredSecret(process.env.SMTP_PASS);
  const smtpHost =
    getConfiguredSecret(process.env.SMTP_HOST) ||
    (smtpUser && smtpUser.toLowerCase().endsWith("@gmail.com")
      ? "smtp.gmail.com"
      : "");

  const isValidHost =
    smtpHost === "localhost" ||
    /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(smtpHost);

  if (smtpHost && smtpUser && smtpPass) {
    if (!isValidHost) {
      providerErrors.push(
        "SMTP_HOST is not a valid mail server hostname (use smtp.gmail.com for Gmail)."
      );
    } else {
      try {
        const rawPort = Number(process.env.SMTP_PORT);
        const port =
          Number.isInteger(rawPort) && rawPort >= 1 && rawPort <= 65535
            ? rawPort
            : 465;
        const isGmail =
          smtpHost.toLowerCase() === "smtp.gmail.com" ||
          smtpUser.toLowerCase().endsWith("@gmail.com");

        const transporter = isGmail
          ? nodemailer.createTransport({
              service: "gmail",
              // Fail fast where hosts block SMTP (Railway/Render free tiers) so API providers get tried.
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 15000,
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            })
          : nodemailer.createTransport({
              host: smtpHost,
              port,
              secure: port === 465,
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 15000,
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            });
        const fromAddress =
          getConfiguredSecret(process.env.SMTP_FROM) ||
          getConfiguredSecret(process.env.EMAIL_FROM) ||
          `SkillLoop AI <${smtpUser}>`;
        await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          text: textBody,
          html: htmlBody,
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

  // 2. Resend HTTPS API
  const resendKey = getConfiguredSecret(process.env.RESEND_API_KEY);
  if (resendKey) {
    try {
      const fromAddress =
        getConfiguredSecret(process.env.EMAIL_FROM) ||
        "SkillLoop AI <onboarding@resend.dev>";
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(5000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          text: textBody,
          html: htmlBody,
        }),
      });
      if (resp.ok) {
        return { sent: true, provider: "Resend Email API" };
      }
      const errBody = await resp.text().catch(() => "");
      const detail = extractSafeProviderMessage(errBody);
      console.error("Resend email delivery failed:", resp.status, detail);
      providerErrors.push(
        detail
          ? `Resend rejected the email (${resp.status}): ${detail}`
          : `Resend rejected the email (${resp.status}). Check RESEND_API_KEY and verified sender domain.`
      );
    } catch (err) {
      console.error("Resend network error:", err);
      providerErrors.push("Unable to connect to Resend email service.");
    }
  }

  // 3. SendGrid HTTPS API
  const sendgridKey = getConfiguredSecret(process.env.SENDGRID_API_KEY);
  if (sendgridKey) {
    try {
      const fromEmail =
        getConfiguredSecret(process.env.EMAIL_FROM) ||
        getConfiguredSecret(process.env.SMTP_FROM) ||
        "no-reply@skillloop.ai";
      const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        signal: AbortSignal.timeout(5000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sendgridKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail, name: "SkillLoop AI" },
          subject,
          content: [
            { type: "text/plain", value: textBody },
            { type: "text/html", value: htmlBody },
          ],
        }),
      });
      if (resp.ok) {
        return { sent: true, provider: "SendGrid Email API" };
      }
      const errBody = await resp.text().catch(() => "");
      const detail = extractSafeProviderMessage(errBody);
      console.error("SendGrid delivery failed:", resp.status, detail);
      providerErrors.push(
        detail
          ? `SendGrid rejected the email (${resp.status}): ${detail}`
          : `SendGrid rejected the email (${resp.status}). Check SENDGRID_API_KEY and verified sender.`
      );
    } catch (err) {
      console.error("SendGrid network error:", err);
      providerErrors.push("Unable to connect to SendGrid email service.");
    }
  }

  // 4. Brevo (Sendinblue) HTTPS API
  const brevoKey = getConfiguredSecret(process.env.BREVO_API_KEY);
  if (brevoKey) {
    try {
      const fromEmail =
        getConfiguredSecret(process.env.EMAIL_FROM) ||
        getConfiguredSecret(process.env.SMTP_FROM) ||
        "no-reply@skillloop.ai";
      const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        signal: AbortSignal.timeout(5000),
        headers: {
          "Content-Type": "application/json",
          "api-key": brevoKey,
        },
        body: JSON.stringify({
          sender: { name: "SkillLoop AI", email: fromEmail },
          to: [{ email: to, name }],
          subject,
          textContent: textBody,
          htmlContent: htmlBody,
        }),
      });
      if (resp.ok) {
        return { sent: true, provider: "Brevo Email API" };
      }
      const errBody = await resp.text().catch(() => "");
      const detail = extractSafeProviderMessage(errBody);
      console.error("Brevo delivery failed:", resp.status, detail);
      providerErrors.push(
        detail
          ? `Brevo rejected the email (${resp.status}): ${detail}`
          : `Brevo rejected the email (${resp.status}). Check BREVO_API_KEY and sender email.`
      );
    } catch (err) {
      console.error("Brevo network error:", err);
      providerErrors.push("Unable to connect to Brevo email service.");
    }
  }

  if (providerErrors.length > 0) {
    return {
      sent: false,
      error: providerErrors.join(" | "),
    };
  }

  // 5. No email provider secrets configured -> simulated code in development!
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n==============================================\n🔑 [DEV MODE] Verification Code for ${to}: ${code}\n==============================================\n`);
    return {
      sent: true,
      provider: "Local Dev Verification (Simulated)",
    };
  }

  return {
    sent: false,
    error:
      "Email service is not configured yet. Add SMTP_USER & SMTP_PASS (Gmail App Password) or a valid RESEND_API_KEY in AI Studio Secrets to send genuine verification codes.",
  };
}

function toBase64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string): string {
  const padLen = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLen);
  return Buffer.from(padded, "base64").toString("utf8");
}

export function signSessionToken(user: PublicUser): string {
  const secret = getSessionSecret();
  const nowSec = Math.floor(Date.now() / 1000);
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadObj: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: nowSec,
    exp: nowSec + 60 * 60 * 24 * 7, // 7 days
  };
  const payload = toBase64Url(JSON.stringify(payloadObj));
  const data = `${header}.${payload}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  return `${data}.${toBase64Url(sig)}`;
}

export function verifySessionToken(token: string): TokenPayload | null {
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

    const decoded = JSON.parse(fromBase64Url(payload)) as TokenPayload;
    const nowSec = Math.floor(Date.now() / 1000);
    if (!decoded.exp || decoded.exp < nowSec) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function sanitizeUser(user: StoredUser): PublicUser {
  const { passwordHash: _removed, ...safe } = user;
  return safe;
}
