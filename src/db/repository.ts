import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleAuthProvider } from "../lib/firebase";
import {
  ActivityItem,
  AutoSavedQuizState,
  ConceptualFeedback,
  Course,
  EducatorDraftItem,
  QuizAttemptRecord,
  QuizQuestion,
  RecoveryLogEntry,
  SignupCodeRequestResult,
  StudyPlanRecord,
  TopicMastery,
  UserRecord,
  UserRole,
} from "../types";
import {
  ADMIN_RECOVERY_LOGS,
  DEMO_USERS,
  INITIAL_ACTIVITY,
  INITIAL_COURSES,
  INITIAL_EDUCATOR_DRAFTS,
  INITIAL_TOPIC_MASTERY,
  QUIZ_BANK,
} from "../data/seedData";

const KEYS = {
  SESSION: "skillloop_db_session_v1",
  TOKEN: "skillloop_auth_token_v1",
  QUESTIONS: "skillloop_db_questions_v1",
  RECOVERY_LOGS: "skillloop_db_recovery_logs_v1",
  DRAFTS: "skillloop_db_educator_drafts_v1",
};

// User-specific keys: data is namespaced by userId so each account has its own saved state
function userKeys(userId: string) {
  return {
    COURSES: `skillloop_db_courses_v1_${userId}`,
    ATTEMPTS: `skillloop_db_attempts_v1_${userId}`,
    MASTERY: `skillloop_db_mastery_v1_${userId}`,
    STUDY_PLAN: `skillloop_db_study_plan_v1_${userId}`,
    AUTO_SAVED_QUIZ: `skillloop_db_autosaved_quiz_v1_${userId}`,
    ACTIVITIES: `skillloop_db_activities_v1_${userId}`,
    FEEDBACK: `skillloop_db_feedback_v1_${userId}`,
    METRICS: `skillloop_db_metrics_v1_${userId}`,
  };
}

// Returns the userId of the currently logged-in session (or "guest" as fallback)
function getCurrentUserId(): string {
  if (typeof window === "undefined") return "guest";
  try {
    const raw = window.localStorage.getItem(KEYS.SESSION);
    if (!raw) return "guest";
    const parsed = JSON.parse(raw) as { id?: string };
    return parsed?.id || "guest";
  } catch {
    return "guest";
  }
}

// Firebase ID tokens are kept strictly in memory (never persisted to localStorage)
let inMemoryFirebaseToken: string | null = null;

/** Resets all user-specific app data to a clean blank slate in localStorage.
 *  Called ONLY on first-time signup so a new account starts fresh.
 *  Existing accounts retain their progress on logout/login. */
export function clearUserData(userId?: string): void {
  if (typeof window === "undefined") return;
  const uid = userId || getCurrentUserId();
  const UK = userKeys(uid);

  // Reset courses to catalog but with all progress zeroed out
  const freshCourses = INITIAL_COURSES.map((c) => ({
    ...c,
    progress: 0,
    completedLessons: 0,
    status: "Not Started" as const,
    modules: c.modules?.map((m) => ({ ...m, completed: false })) ?? [],
  }));
  writeJson(UK.COURSES, freshCourses);

  // Topics with 0% initial mastery
  const freshTopics = INITIAL_TOPIC_MASTERY.map((t) => ({
    ...t,
    mastery: 0,
    retention_health: "Needs Review" as const,
    lastPracticedDaysAgo: 0,
  }));
  writeJson(UK.MASTERY, freshTopics);

  // Everything else starts completely empty
  writeJson(UK.ATTEMPTS, []);
  writeJson(UK.ACTIVITIES, []);
  writeJson(UK.FEEDBACK, []);
  writeJson(UK.METRICS, { overallProgress: 0, quizAccuracy: 0, studyMinutesTotal: 0 });
  writeJson(UK.STUDY_PLAN, {
    selectedMinutes: 15,
    isRecoveryMode: false,
    completedStepIds: [],
    updatedAt: new Date().toISOString(),
  });
  window.localStorage.removeItem(UK.AUTO_SAVED_QUIZ);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or restricted
  }
}

function getAuthToken(): string | null {
  if (inMemoryFirebaseToken) return inMemoryFirebaseToken;
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEYS.TOKEN);
}

function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(KEYS.TOKEN, token);
  } else {
    window.localStorage.removeItem(KEYS.TOKEN);
  }
}

async function parseApiJson(
  res: Response
): Promise<Record<string, unknown> | null> {
  try {
    const raw = await res.text();
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getHttpFallbackError(res: Response, defaultMsg: string): string {
  if (res.status === 502 || res.status === 504) {
    return `Server request timed out (HTTP ${res.status}). Please retry.`;
  }
  return `${defaultMsg} (HTTP ${res.status})`;
}

// 1. Backend-Authenticated Users & Signed Session Repository
export const AuthRepo = {
  getSession(): UserRecord | null {
    return readJson<UserRecord | null>(KEYS.SESSION, null);
  },

  getToken(): string | null {
    return getAuthToken();
  },

  async verifySessionOnServer(): Promise<UserRecord | null> {
    if (auth.currentUser && !inMemoryFirebaseToken) {
      try {
        inMemoryFirebaseToken = await auth.currentUser.getIdToken();
      } catch {
        // Ignore refresh error
      }
    }
    const token = getAuthToken();
    if (!token) return this.getSession();
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 404) {
        this.logout();
        return null;
      }
      if (!res.ok) return this.getSession();
      const data = await parseApiJson(res);
      if (data?.user) {
        writeJson(KEYS.SESSION, data.user);
        return data.user as UserRecord;
      }
    } catch {
      // Offline fallback keeps cached session
    }
    return this.getSession();
  },

  async loginWithGoogle(): Promise<{ user?: UserRecord; error?: string }> {
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await cred.user.getIdToken();
      inMemoryFirebaseToken = idToken;

      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await parseApiJson(res);
      if (!res.ok || !data?.user) {
        inMemoryFirebaseToken = null;
        return {
          error:
            (typeof data?.error === "string" && data.error) ||
            getHttpFallbackError(res, "Unable to verify Google account."),
        };
      }
      clearUserData((data.user as UserRecord)?.id);
      writeJson(KEYS.SESSION, data.user);
      return { user: data.user as UserRecord };
    } catch (err) {
      inMemoryFirebaseToken = null;
      const msg =
        err instanceof Error && err.message.includes("popup-closed-by-user")
          ? "Google sign-in popup was closed."
          : "Google sign-in could not be completed. Please try again.";
      return { error: msg };
    }
  },

  async loginWithEmail(
    email: string,
    password: string
  ): Promise<{ user?: UserRecord; error?: string }> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseApiJson(res);
      if (!res.ok || !data) {
        return {
          error:
            (typeof data?.error === "string" && data.error) ||
            getHttpFallbackError(res, "Invalid email or password."),
        };
      }
      inMemoryFirebaseToken = null;
      // Do NOT clear user data on login — preserve existing progress
      setAuthToken(String(data.token ?? ""));
      writeJson(KEYS.SESSION, data.user);
      return { user: data.user as UserRecord };
    } catch {
      return {
        error:
          "Unable to reach authentication server. Please check connection or use Demo Access.",
      };
    }
  },

  async loginDemo(role: UserRole): Promise<{ user: UserRecord; offline?: boolean }> {
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await parseApiJson(res);
        if (data?.user && data?.token) {
          inMemoryFirebaseToken = null;
          setAuthToken(String(data.token));
          writeJson(KEYS.SESSION, data.user);
          return { user: data.user as UserRecord };
        }
      }
    } catch {
      // Offline fallback below
    }
    const fallback =
      DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    const updatedUser: UserRecord = {
      ...fallback,
      last_active_at: new Date().toISOString(),
    };
    writeJson(KEYS.SESSION, updatedUser);
    return { user: updatedUser, offline: true };
  },

  async requestSignupCode(params: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<SignupCodeRequestResult> {
    try {
      const res = await fetch("/api/auth/signup/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await parseApiJson(res);
      if (!res.ok || !data) {
        return {
          error:
            (typeof data?.error === "string" && data.error) ||
            getHttpFallbackError(res, "Unable to send verification code."),
        };
      }
      return data as unknown as SignupCodeRequestResult;
    } catch {
      return {
        error:
          "Unable to connect to the verification server. Please wait a moment and retry.",
      };
    }
  },

  async verifySignupCode(params: {
    email: string;
    code: string;
  }): Promise<{ user?: UserRecord; error?: string }> {
    try {
      const res = await fetch("/api/auth/signup/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await parseApiJson(res);
      if (!res.ok || !data) {
        return {
          error:
            (typeof data?.error === "string" && data.error) ||
            getHttpFallbackError(res, "Verification failed."),
        };
      }
      inMemoryFirebaseToken = null;
      // New account signup — initialize fresh data for the new user ID
      setAuthToken(String(data.token ?? ""));
      writeJson(KEYS.SESSION, data.user);
      clearUserData((data.user as UserRecord)?.id);
      return { user: data.user as UserRecord };
    } catch {
      return {
        error:
          "Unable to connect to the verification server. Please wait a moment and retry.",
      };
    }
  },

  async signup(params: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ user?: UserRecord; error?: string }> {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await parseApiJson(res);
      if (!res.ok || !data) {
        return {
          error:
            (typeof data?.error === "string" && data.error) ||
            getHttpFallbackError(res, "Unable to create account."),
        };
      }
      inMemoryFirebaseToken = null;
      // New account signup — initialize fresh data for the new user ID
      setAuthToken(String(data.token ?? ""));
      writeJson(KEYS.SESSION, data.user);
      clearUserData((data.user as UserRecord)?.id);
      return { user: data.user as UserRecord };
    } catch {
      return {
        error:
          "Unable to connect to the verification server. Please wait a moment and retry.",
      };
    }
  },

  updateCurrentUser(patch: Partial<UserRecord>): UserRecord | null {
    const current = this.getSession();
    if (!current) return null;
    const updated: UserRecord = { ...current, ...patch };
    writeJson(KEYS.SESSION, updated);

    const token = getAuthToken();
    if (token) {
      void fetch("/api/auth/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferred_language: updated.preferred_language,
          accessibility_prefs: updated.accessibility_prefs,
          last_active_at: updated.last_active_at,
        }),
      }).catch(() => {});
    }

    return updated;
  },

  logout(): void {
    inMemoryFirebaseToken = null;
    setAuthToken(null);
    if (auth.currentUser) {
      void signOut(auth).catch(() => {});
    }
    if (typeof window !== "undefined") {
      // Only remove the session token — do NOT wipe user progress data on logout
      // so that when the same user logs back in their progress is preserved
      window.localStorage.removeItem(KEYS.SESSION);
    }
  },
};

// 2. Courses & Lessons Repository
export const CourseRepo = {
  getAll(): Course[] {
    const UK = userKeys(getCurrentUserId());
    const saved = readJson<Course[]>(UK.COURSES, INITIAL_COURSES);
    // Merge new courses or modules seamlessly if local cache is from an older version
    if (!saved || saved.length < INITIAL_COURSES.length) {
      const merged = INITIAL_COURSES.map((init) => {
        const found = saved?.find((s) => s.id === init.id);
        if (!found) return init;
        return {
          ...init,
          progress: found.progress ?? 0,
          status: found.status ?? "Not Started",
          completedLessons: found.completedLessons ?? 0,
          modules: init.modules.map((m) => {
            const savedMod = found.modules?.find((sm) => sm.id === m.id);
            return savedMod ? { ...m, completed: savedMod.completed } : m;
          }),
        };
      });
      writeJson(UK.COURSES, merged);
      return merged;
    }
    return saved;
  },
  saveAll(courses: Course[]): void {
    writeJson(userKeys(getCurrentUserId()).COURSES, courses);
  },
};

// 3. Questions Repository
export const QuestionRepo = {
  getAll(): QuizQuestion[] {
    return readJson<QuizQuestion[]>(KEYS.QUESTIONS, QUIZ_BANK);
  },
  saveAll(questions: QuizQuestion[]): void {
    writeJson(KEYS.QUESTIONS, questions);
  },
  publishEducatorDraft(
    draft: EducatorDraftItem,
    topics: TopicMastery[]
  ): QuizQuestion {
    const matchedTopic =
      topics.find(
        (t) => t.name.toLowerCase() === draft.topicName.toLowerCase()
      ) || topics[2];

    const newQuestion: QuizQuestion = {
      id: `q-edu-${draft.id}`,
      courseId: matchedTopic?.courseId || "python-101",
      topicId: matchedTopic?.id || "topic-loops",
      topicName: draft.topicName,
      difficulty: draft.difficulty,
      question: draft.question,
      questionUr: draft.question,
      questionRomanUr: draft.question,
      codeSnippet: draft.codeSnippet,
      options: draft.options,
      correctAnswer: draft.correctAnswer,
      conceptHint: draft.explanation,
      approved_by_educator: true,
    };

    const existing = this.getAll();
    const filtered = existing.filter((q) => q.id !== newQuestion.id);
    const next = [newQuestion, ...filtered];
    this.saveAll(next);
    return newQuestion;
  },
};

// 4. Mastery Records & Quiz Attempts Repository
export const MasteryRepo = {
  getTopics(): TopicMastery[] {
    const UK = userKeys(getCurrentUserId());
    const saved = readJson<TopicMastery[]>(UK.MASTERY, INITIAL_TOPIC_MASTERY);
    if (!saved || saved.length < INITIAL_TOPIC_MASTERY.length) {
      const merged = INITIAL_TOPIC_MASTERY.map((init) => {
        const found = saved?.find((s) => s.id === init.id);
        return found ? { ...init, ...found } : init;
      });
      writeJson(UK.MASTERY, merged);
      return merged;
    }
    return saved;
  },
  saveTopics(topics: TopicMastery[]): void {
    writeJson(userKeys(getCurrentUserId()).MASTERY, topics);
  },
  getAttempts(): QuizAttemptRecord[] {
    return readJson<QuizAttemptRecord[]>(userKeys(getCurrentUserId()).ATTEMPTS, []);
  },
  recordAttempt(attempt: QuizAttemptRecord): QuizAttemptRecord[] {
    const UK = userKeys(getCurrentUserId());
    const next = [attempt, ...this.getAttempts()].slice(0, 100);
    writeJson(UK.ATTEMPTS, next);

    const token = getAuthToken();
    if (token) {
      void fetch("/api/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(attempt),
      }).catch(() => {});
    }

    return next;
  },
};

// 5. Study Plans, Auto-Saved Quiz State, & Recovery Logs Repository
export const StudyPlanRepo = {
  getPlan(): StudyPlanRecord {
    return readJson<StudyPlanRecord>(userKeys(getCurrentUserId()).STUDY_PLAN, {
      selectedMinutes: 15,
      isRecoveryMode: false,
      completedStepIds: [],
      updatedAt: new Date().toISOString(),
    });
  },
  savePlan(plan: StudyPlanRecord): void {
    writeJson(userKeys(getCurrentUserId()).STUDY_PLAN, plan);
  },
  getAutoSavedQuiz(): AutoSavedQuizState | null {
    return readJson<AutoSavedQuizState | null>(userKeys(getCurrentUserId()).AUTO_SAVED_QUIZ, null);
  },
  saveAutoSavedQuiz(state: AutoSavedQuizState | null): void {
    const key = userKeys(getCurrentUserId()).AUTO_SAVED_QUIZ;
    if (!state) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
      return;
    }
    writeJson(key, state);
  },
  getRecoveryLogs(): RecoveryLogEntry[] {
    return readJson<RecoveryLogEntry[]>(KEYS.RECOVERY_LOGS, ADMIN_RECOVERY_LOGS);
  },
  saveRecoveryLogs(logs: RecoveryLogEntry[]): void {
    writeJson(KEYS.RECOVERY_LOGS, logs);
  },
};

// 6. Drafts, Activities, Feedback, Metrics Repository
export const AppStateRepo = {
  getDrafts(): EducatorDraftItem[] {
    return readJson<EducatorDraftItem[]>(KEYS.DRAFTS, INITIAL_EDUCATOR_DRAFTS);
  },
  saveDrafts(drafts: EducatorDraftItem[]): void {
    writeJson(KEYS.DRAFTS, drafts);
  },
  getActivities(): ActivityItem[] {
    return readJson<ActivityItem[]>(userKeys(getCurrentUserId()).ACTIVITIES, INITIAL_ACTIVITY);
  },
  saveActivities(items: ActivityItem[]): void {
    writeJson(userKeys(getCurrentUserId()).ACTIVITIES, items);
  },
  getFeedback(): ConceptualFeedback[] {
    return readJson<ConceptualFeedback[]>(userKeys(getCurrentUserId()).FEEDBACK, []);
  },
  saveFeedback(items: ConceptualFeedback[]): void {
    writeJson(userKeys(getCurrentUserId()).FEEDBACK, items);
  },
  getMetrics(): {
    overallProgress: number;
    quizAccuracy: number;
    studyMinutesTotal: number;
  } {
    return readJson(userKeys(getCurrentUserId()).METRICS, {
      overallProgress: 0,
      quizAccuracy: 0,
      studyMinutesTotal: 0,
    });
  },
  saveMetrics(metrics: {
    overallProgress: number;
    quizAccuracy: number;
    studyMinutesTotal: number;
  }): void {
    writeJson(userKeys(getCurrentUserId()).METRICS, metrics);
  },
};
