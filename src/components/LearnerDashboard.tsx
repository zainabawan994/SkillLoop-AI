import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Flame,
  Pause,
  Play,
  RotateCcw,
  TrendingUp,
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
  ActivityItem,
  Course,
  LanguageCode,
  NavTab,
  TopicMastery,
} from "../types";
import { TranslationSet } from "../data/translations";
import { WEEKLY_PROGRESS_CHART, buildMicroSession } from "../data/seedData";

interface LearnerDashboardProps {
  userName?: string;
  courses: Course[];
  topics: TopicMastery[];
  activities?: ActivityItem[];
  overallProgress: number;
  quizAccuracy: number;
  streakDays: number;
  studyMinutesTotal: number;
  language: LanguageCode;
  t: TranslationSet;
  onNavigateTab: (tab: NavTab) => void;
  onOpenCourse: (courseId: string) => void;
  onStartTopicPractice: (topicId: string) => void;
  onCompleteSessionMinutes: (minutes: number, topicName: string) => void;
  recoveryPlanBanner: boolean;
  onOpenRecoveryModal: () => void;
}

const TIME_SLOTS = [10, 15, 20, 30] as const;

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  userName,
  courses,
  topics,
  overallProgress,
  quizAccuracy,
  streakDays,
  studyMinutesTotal,
  language,
  t,
  onNavigateTab,
  onOpenCourse,
  onStartTopicPractice,
  onCompleteSessionMinutes,
  recoveryPlanBanner,
  onOpenRecoveryModal,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [activeSessionRunning, setActiveSessionRunning] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [sessionDoneMessage, setSessionDoneMessage] = useState<string | null>(
    null
  );

  const sessionSteps = useMemo(
    () => buildMicroSession(selectedMinutes, topics, recoveryPlanBanner),
    [selectedMinutes, topics, recoveryPlanBanner]
  );

  const weakestTopic = useMemo(
    () => [...topics].sort((a, b) => a.mastery - b.mastery)[0],
    [topics]
  );

  const totalHours = Math.floor(studyMinutesTotal / 60);
  const remMins = studyMinutesTotal % 60;

  const firstName = (userName || "Fahad").trim().split(/\s+/)[0];
  const personalizedGreeting =
    language === "ur"
      ? `خوش آمدید، ${firstName}`
      : language === "roman_ur"
      ? `Khush amdeed, ${firstName}`
      : `Welcome back, ${firstName}`;

  const handleToggleStep = (stepId: string) => {
    setCompletedStepIds((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  const handleFinishMicroSession = () => {
    setActiveSessionRunning(false);
    setSessionPaused(false);
    setCompletedStepIds([]);
    onCompleteSessionMinutes(
      selectedMinutes,
      weakestTopic?.name || "Loops & Functions"
    );
    setSessionDoneMessage(`Logged ${selectedMinutes} min session.`);
    setTimeout(() => setSessionDoneMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {recoveryPlanBanner && (
        <div className="hc-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-5 py-3.5 text-slate-900 shadow-xs">
          <div className="text-xs font-medium text-amber-950">
            <span className="font-bold">Welcome back!</span> A gentle 10-minute warmup is prepared to ease you back into flow.
          </div>
          <button
            type="button"
            onClick={onOpenRecoveryModal}
            className="rounded-xl bg-amber-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 transition-colors whitespace-nowrap"
          >
            Start Warmup →
          </button>
        </div>
      )}

      {/* 1. Clean Page Header Row (No Heavy Gradient Banner / Stock Photo) */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {personalizedGreeting}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 hc-muted">
            Next priority: <span className="font-semibold text-slate-700">{weakestTopic?.name}</span> ({weakestTopic?.mastery}% mastery)
          </p>
        </div>

        <a
          href="/practice"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
              e.preventDefault();
              onStartTopicPractice(weakestTopic?.id || "topic-functions");
            }
          }}
          className="hc-btn-primary inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 whitespace-nowrap"
        >
          <span>{t.resumeLearning}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </section>

      {/* 2. 4 Clean Uniform KPI Cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{t.kpis.overallProgress}</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
            {overallProgress}%
          </div>
        </div>

        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{t.kpis.quizAccuracy}</span>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
            {quizAccuracy}%
          </div>
        </div>

        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{t.kpis.studyStreak}</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
            {streakDays} Days
          </div>
        </div>

        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{t.kpis.totalStudyTime}</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
            {totalHours}h {remMins}m
          </div>
        </div>
      </section>

      {/* 3. Balanced 2-Column Workspace */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Courses + Today's Study Plan */}
        <div className="space-y-6 lg:col-span-7">
          {/* Clean My Courses List (No Stock Thumbnails) */}
          <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h2 className="text-base font-bold text-slate-900">
                {t.myCourses}
              </h2>
              <a
                href="/courses"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onNavigateTab("courses");
                  }
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                All courses →
              </a>
            </div>

            <div className="divide-y divide-slate-100">
              {courses.map((course) => {
                const localizedTitle =
                  language === "ur"
                    ? course.titleUr
                    : language === "roman_ur"
                    ? course.titleRomanUr
                    : course.title;

                return (
                  <div
                    key={course.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-4 last:pb-0"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {localizedTitle}
                        </h3>
                        <span className="tabular-nums text-xs font-bold text-slate-700">
                          {course.progress}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {course.subtitle}
                      </p>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            course.progress > 0 ? "bg-indigo-600" : "bg-slate-200"
                          }`}
                          style={{ width: `${Math.max(course.progress, 3)}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenCourse(course.id)}
                      className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                        course.status === "Not Started"
                          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      }`}
                    >
                      {course.status === "Not Started"
                        ? t.startCourse
                        : t.continueLearning}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clean Today's Study Plan */}
          <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">
                {t.studyPlannerTitle}
              </h2>

              <div
                className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-100/80 p-1"
                role="group"
                aria-label="Available study duration"
              >
                {TIME_SLOTS.map((mins) => {
                  const active = selectedMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setSelectedMinutes(mins);
                        setActiveSessionRunning(false);
                        setCompletedStepIds([]);
                      }}
                      className={`tabular-nums rounded-lg px-2.5 py-1 text-xs font-bold transition-all whitespace-nowrap ${
                        active
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {mins}m
                    </button>
                  );
                })}
              </div>
            </div>

            {sessionDoneMessage && (
              <div className="mt-3 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800">
                {sessionDoneMessage}
              </div>
            )}

            <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
              {sessionSteps.map((step, idx) => {
                const checked = completedStepIds.includes(step.id);
                return (
                  <div
                    key={step.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {activeSessionRunning ? (
                        <button
                          type="button"
                          onClick={() => handleToggleStep(step.id)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                            checked
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 bg-white text-transparent hover:border-indigo-500"
                          }`}
                          aria-label={`Mark ${step.title} complete`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="tabular-nums flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-600">
                          {idx + 1}
                        </span>
                      )}
                      <div className="min-w-0">
                        <div
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            checked
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {step.topicName}
                        </div>
                      </div>
                    </div>
                    <span className="tabular-nums shrink-0 text-xs font-semibold text-slate-500">
                      {step.minutes}m
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">
                Focus: <strong className="text-slate-700">{weakestTopic?.name}</strong>
              </span>

              {!activeSessionRunning ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveSessionRunning(true);
                    setSessionPaused(false);
                  }}
                  className="hc-btn-primary inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 whitespace-nowrap"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>{t.startSession}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSessionPaused((p) => !p)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {sessionPaused ? (
                      <Play className="h-3.5 w-3.5" />
                    ) : (
                      <Pause className="h-3.5 w-3.5" />
                    )}
                    <span>{sessionPaused ? "Resume" : "Pause"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSessionRunning(false);
                      setCompletedStepIds([]);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishMicroSession}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Complete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Topic Mastery + Clean Weekly Chart */}
        <div className="space-y-6 lg:col-span-5">
          <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <h2 className="text-base font-bold text-slate-900">
              {t.adaptiveTopicMastery}
            </h2>

            <div className="mt-4 space-y-4">
              {topics.slice(0, 4).map((topic) => {
                const isWeak = topic.mastery < 60;
                const label =
                  language === "ur"
                    ? topic.nameUr
                    : language === "roman_ur"
                    ? topic.nameRomanUr
                    : topic.name;

                return (
                  <div key={topic.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {label}
                      </span>
                      <span className="tabular-nums font-bold text-slate-900">
                        {topic.mastery}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isWeak
                            ? "bg-amber-500"
                            : topic.mastery >= 85
                            ? "bg-emerald-500"
                            : "bg-indigo-600"
                        }`}
                        style={{ width: `${topic.mastery}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                onStartTopicPractice(weakestTopic?.id || "topic-functions")
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              <span>Practice {weakestTopic?.name}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="hc-card min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {t.learningProgressTitle}
              </h2>
              <span className="tabular-nums text-xs font-semibold text-indigo-600">
                This Week
              </span>
            </div>

            <div className="mt-4 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={WEEKLY_PROGRESS_CHART}
                  margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="thisWeekGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[40, 90]}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="thisWeek"
                    name={t.thisWeek}
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fill="url(#thisWeekGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
