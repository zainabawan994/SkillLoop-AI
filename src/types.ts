export type UserRole = "learner" | "educator" | "admin";

export type LanguageCode = "en" | "ur" | "roman_ur";

export type NavTab =
  | "dashboard"
  | "courses"
  | "practice"
  | "planner"
  | "progress"
  | "feedback"
  | "resources"
  | "settings";

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export interface AccessibilityPrefs {
  fontSize: "normal" | "large";
  highContrast: boolean;
  ttsEnabled: boolean;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  email_verified?: boolean;
  preferred_language: LanguageCode;
  accessibility_prefs: AccessibilityPrefs;
  streak_days: number;
  last_active_at: string;
}

export interface SignupCodeRequestResult {
  ok?: boolean;
  email?: string;
  expiresInSec?: number;
  deliveryMode?: "email";
  provider?: string;
  error?: string;
}

export interface TopicMastery {
  id: string;
  courseId: string;
  name: string;
  nameUr: string;
  nameRomanUr: string;
  mastery: number;
  retention_health: "Healthy" | "Needs Review" | "At Risk";
  lastPracticedDaysAgo: number;
  summary: string;
}

export interface CourseModule {
  id: string;
  title: string;
  durationMin: number;
  completed: boolean;
  conceptNotes: string;
  codeExample: string;
  captions: string[];
  offlineSummary: string;
}

export interface Course {
  id: string;
  title: string;
  titleUr: string;
  titleRomanUr: string;
  subtitle: string;
  status: "In Progress" | "Not Started" | "Completed";
  progress: number;
  thumbnail: string;
  totalLessons: number;
  completedLessons: number;
  estimatedWeeklyMin: number;
  modules: CourseModule[];
}

export interface QuizQuestion {
  id: string;
  courseId: string;
  topicId: string;
  topicName: string;
  difficulty: DifficultyLevel;
  question: string;
  questionUr: string;
  questionRomanUr: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: string;
  allowFreeInput?: boolean;
  defaultMisconceptionInput?: string;
  conceptHint: string;
  approved_by_educator: boolean;
}

export interface QuizAttemptRecord {
  id: string;
  user_id: string;
  question_id: string;
  topic_id: string;
  topic_name: string;
  selected_answer: string;
  is_correct: boolean;
  response_time_ms: number;
  created_at: string;
}

export interface AutoSavedQuizState {
  questionId: string;
  topicId: string | null;
  selectedOption: string;
  customInput: string;
  savedAt: string;
}

export interface StudyPlanRecord {
  selectedMinutes: number;
  isRecoveryMode: boolean;
  completedStepIds: string[];
  updatedAt: string;
}

export interface ConceptualFeedback {
  id: string;
  timestamp: string;
  topicName: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  source: "gemini" | "rule-based";
  whyOutcome: string;
  coreConcept: string;
  stepByStep: string;
  followUpQuestion: string;
  followUpOptions: string[];
  followUpAnswer: string;
  masteryDelta: number;
}

export interface MicroSessionStep {
  id: string;
  title: string;
  type: "revision" | "quiz" | "explanation" | "guided";
  minutes: number;
  topicName: string;
  description: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  meta: string;
  score?: string;
  timeAgo: string;
  type: "quiz" | "concept" | "recovery" | "streak";
}

export interface EducatorDraftItem {
  id: string;
  courseTitle: string;
  topicName: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: string;
  difficulty: DifficultyLevel;
  explanation: string;
  status: "Pending Review" | "Approved" | "Rejected";
  createdAt: string;
}

export interface CohortWeekPoint {
  week: string;
  mastery: number;
  accuracy: number;
  activeLearners: number;
  retentionScore: number;
}

export interface CohortTopicHeatmapRow {
  topic: string;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
  retentionCheck: number;
}

export interface SimulatedCohortLearner {
  id: string;
  name: string;
  scheduleType: string;
  course: string;
  week1Mastery: number;
  week4Mastery: number;
  quizAccuracy: number;
  delayedRetention: number;
  activeThisWeek: boolean;
}

export interface TutorMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: "gemini" | "rule-based";
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export interface RecoveryLogEntry {
  id: string;
  timestamp: string;
  event: string;
  component: string;
  severity: "Resolved" | "Fallback Active" | "Info";
  detail: string;
}
