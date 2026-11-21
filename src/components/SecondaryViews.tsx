import React, { useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  Captions,
  CheckCircle2,
  Clock,
  MessageSquareText,
  Play,
  Settings as SettingsIcon,
  Sparkles,
  TrendingUp,
  Volume2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ConceptualFeedback,
  Course,
  LanguageCode,
  TopicMastery,
} from "../types";
import { WEEKLY_PROGRESS_CHART, buildMicroSession } from "../data/seedData";

/* ---------------- MY COURSES VIEW ---------------- */
interface CoursesViewProps {
  courses: Course[];
  selectedCourseId: string | null;
  onSelectCourse: (id: string) => void;
  onCompleteLesson: (courseId: string, moduleId: string) => void;
  onPracticeCourse: () => void;
  onSpeakText: (text: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  selectedCourseId,
  onSelectCourse,
  onCompleteLesson,
  onPracticeCourse,
  onSpeakText,
}) => {
  const [openCaptionId, setOpenCaptionId] = useState<string | null>(null);
  const activeCourse =
    courses.find((c) => c.id === selectedCourseId) || courses[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          My Courses
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Micro-lessons with captions and audio playback.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-2.5 lg:col-span-4">
          {courses.map((c) => {
            const active = c.id === activeCourse.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCourse(c.id)}
                className={`hc-card flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-start transition-all ${
                  active
                    ? "border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {c.title}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 truncate">
                    {c.completedLessons}/{c.totalLessons} lessons
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
                <span className="tabular-nums text-xs font-extrabold text-indigo-700 shrink-0">
                  {c.progress}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Course Modules */}
        <div className="hc-card min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 lg:col-span-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {activeCourse.title}
              </h2>
              <p className="text-xs text-slate-500">{activeCourse.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onPracticeCourse}
              className="hc-btn-primary inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 whitespace-nowrap"
            >
              <span>Practice Topics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {activeCourse.modules.map((mod, idx) => {
              const showCaptions = openCaptionId === mod.id;
              return (
                <div
                  key={mod.id}
                  className="py-5 first:pt-0 last:pb-0 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tabular-nums flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {mod.title}
                      </span>
                      <span className="tabular-nums text-xs text-slate-400">
                        · {mod.durationMin}m
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenCaptionId(showCaptions ? null : mod.id)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Captions className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{showCaptions ? "Hide Captions" : "Captions"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onSpeakText(`${mod.title}. ${mod.conceptNotes}`)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Volume2 className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Listen</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onCompleteLesson(activeCourse.id, mod.id)
                        }
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
                          mod.completed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>
                          {mod.completed ? "Completed" : "Mark Complete"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-700">
                    {mod.conceptNotes}
                  </p>
                  <pre className="overflow-x-auto rounded-xl bg-[#0F172A] p-3.5 font-mono text-xs text-indigo-100">
                    <code>{mod.codeExample}</code>
                  </pre>

                  {showCaptions && mod.captions && (
                    <div className="rounded-xl bg-slate-50 p-3.5 space-y-1">
                      {mod.captions.map((line, i) => (
                        <p key={i} className="font-mono text-[11px] text-slate-700">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- STUDY PLANNER VIEW ---------------- */
interface PlannerViewProps {
  topics: TopicMastery[];
  onCompleteSessionMinutes: (minutes: number, topicName: string) => void;
  onStartPractice: () => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  topics,
  onCompleteSessionMinutes,
  onStartPractice,
}) => {
  const [minutes, setMinutes] = useState(15);
  const [started, setStarted] = useState(false);
  const steps = buildMicroSession(minutes, topics, false);
  const weakest = [...topics].sort((a, b) => a.mastery - b.mastery)[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Study Planner
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Choose an available time slot (10–30 minutes).
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {[10, 15, 20, 30].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMinutes(m);
                setStarted(false);
              }}
              className={`tabular-nums rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                minutes === m
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-6 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {minutes}-Minute Plan
            </h2>
            <span className="tabular-nums text-xs font-semibold text-indigo-700">
              Focus: {weakest?.name} ({weakest?.mastery}%)
            </span>
          </div>

          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {steps.map((s, idx) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 py-3.5"
              >
                <div className="flex items-start gap-3">
                  <span className="tabular-nums flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {s.title}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {s.description}
                    </p>
                  </div>
                </div>
                <span className="tabular-nums flex items-center gap-1 text-xs font-bold text-slate-600 whitespace-nowrap">
                  <Clock className="h-3.5 w-3.5" />
                  {s.minutes}m
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            {!started ? (
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="hc-btn-primary inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
              >
                <Play className="h-4 w-4" />
                <span>Start Session</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onStartPractice}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700"
                >
                  <span>Open Practice</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCompleteSessionMinutes(minutes, weakest?.name || "Loops");
                    setStarted(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Complete (+{minutes}m)</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-6 lg:col-span-4 space-y-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Flexible Pace
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            Three short 10–15 minute sessions per week keep your mastery steady without streak penalties.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MY PROGRESS VIEW ---------------- */
export const ProgressView: React.FC<{
  topics: TopicMastery[];
  overallProgress: number;
  quizAccuracy: number;
}> = ({ topics, overallProgress, quizAccuracy }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            My Progress
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Topic-level mastery and weekly growth.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-500">Overall: </span>
            <strong className="tabular-nums text-indigo-700">{overallProgress}%</strong>
          </div>
          <div>
            <span className="text-slate-500">Accuracy: </span>
            <strong className="tabular-nums text-emerald-700">{quizAccuracy}%</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-6 lg:col-span-7">
          <h2 className="text-base font-bold text-slate-900">
            Weekly Mastery Growth
          </h2>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={WEEKLY_PROGRESS_CHART}
                margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[40, 90]} unit="%" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="thisWeek"
                  name="This Week"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fill="#4F46E5"
                  fillOpacity={0.14}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-6 lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Topic Mastery
            </h2>
          </div>

          <div className="space-y-4">
            {topics.map((tp) => (
              <div key={tp.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{tp.name}</span>
                  <span className="tabular-nums font-bold text-indigo-700">
                    {tp.mastery}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      tp.mastery < 60 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${tp.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- AI FEEDBACK HISTORY VIEW ---------------- */
export const FeedbackHistoryView: React.FC<{
  history: ConceptualFeedback[];
  onGoToPractice: () => void;
  onSpeakText: (text: string) => void;
}> = ({ history, onGoToPractice, onSpeakText }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Feedback History
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Conceptual explanations from your practice sessions.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToPractice}
          className="hc-btn-primary inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 whitespace-nowrap"
        >
          <Sparkles className="h-4 w-4" />
          <span>Start Practice</span>
        </button>
      </div>

      {history.length === 0 ? (
        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-10 text-center space-y-2.5">
          <MessageSquareText className="mx-auto h-7 w-7 text-indigo-600" />
          <div className="text-sm font-bold text-slate-900">
            No feedback entries yet
          </div>
          <p className="mx-auto max-w-md text-xs text-slate-500">
            Submit an answer in Smart Practice to save conceptual diagnostics here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {item.topicName}
                  </span>
                  <span>·</span>
                  <span
                    className={`font-bold ${
                      item.isCorrect ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {item.isCorrect ? "Correct" : "Clarified"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSpeakText(`${item.whyOutcome}. ${item.coreConcept}`)
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Volume2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Listen</span>
                </button>
              </div>

              <div className="text-sm font-bold text-slate-900">
                {item.question}
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                {item.whyOutcome}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------- RESOURCES VIEW ---------------- */
export const ResourcesView: React.FC<{
  onSpeakText: (text: string) => void;
  onStartPractice: () => void;
}> = ({ onStartPractice }) => {
  const sheets = [
    {
      title: "Data Types & Casting",
      summary:
        "Use int() and str() when combining text inputs with numbers.",
      snippet: `age = int("28")\nprint(age + 2)   # 30`,
    },
    {
      title: "Loops & range()",
      summary:
        "range(start, stop) includes start and excludes stop.",
      snippet: `total = 0\nfor n in range(1, 5):\n    total += n`,
    },
    {
      title: "return vs print()",
      summary:
        "print() displays output; return passes a value back to the caller.",
      snippet: `def score_pct(ok, total):\n    return round((ok / total) * 100)`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Quick Reference
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {sheets.map((s) => (
          <div
            key={s.title}
            className="hc-card flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4"
          >
            <div className="space-y-2.5">
              <h2 className="text-base font-bold text-slate-900">{s.title}</h2>
              <p className="text-xs leading-relaxed text-slate-600">
                {s.summary}
              </p>
              <pre className="overflow-x-auto rounded-xl bg-[#0F172A] p-3.5 font-mono text-xs text-indigo-100">
                <code>{s.snippet}</code>
              </pre>
            </div>

            <button
              type="button"
              onClick={onStartPractice}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
            >
              Practice
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- SETTINGS VIEW ---------------- */
export const SettingsView: React.FC<{
  largerText: boolean;
  onToggleLargerText: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  ttsEnabled: boolean;
  onToggleTts: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  offlineFallbackOnly: boolean;
  onToggleOfflineMode: () => void;
  onOpenRecoveryModal: () => void;
}> = ({
  largerText,
  onToggleLargerText,
  highContrast,
  onToggleHighContrast,
  ttsEnabled,
  onToggleTts,
  language,
  onLanguageChange,
  offlineFallbackOnly,
  onToggleOfflineMode,
  onOpenRecoveryModal,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <SettingsIcon className="h-5 w-5 text-indigo-600" />
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Accessibility &amp; Language
          </h2>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-medium text-slate-800">
              Larger Text Scale
            </span>
            <button
              type="button"
              onClick={onToggleLargerText}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold ${
                largerText
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {largerText ? "On" : "Off"}
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-medium text-slate-800">
              High Contrast Mode
            </span>
            <button
              type="button"
              onClick={onToggleHighContrast}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold ${
                highContrast
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {highContrast ? "On" : "Off"}
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-medium text-slate-800">
              Text-to-Speech
            </span>
            <button
              type="button"
              onClick={onToggleTts}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold ${
                ttsEnabled
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {ttsEnabled ? "On" : "Off"}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-medium text-slate-800">Language</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900"
            >
              <option value="en">English</option>
              <option value="ur">Urdu / اردو (RTL)</option>
              <option value="roman_ur">Roman Urdu</option>
            </select>
          </div>
        </div>

        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Learning Preferences
          </h2>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-sm font-medium text-slate-800">
                Offline Fallback Mode
              </div>
              <div className="text-xs text-slate-500">
                Use local rule-based feedback
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleOfflineMode}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold ${
                offlineFallbackOnly
                  ? "bg-amber-600 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {offlineFallbackOnly ? "On" : "Auto"}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-sm font-medium text-slate-800">
                Absence Catch-Up Check
              </div>
              <div className="text-xs text-slate-500">
                2-minute warmup for busy weeks
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenRecoveryModal}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
            >
              Run Warmup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
