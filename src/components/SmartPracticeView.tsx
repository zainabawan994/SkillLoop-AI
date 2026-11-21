import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Save,
  Volume2,
} from "lucide-react";
import {
  AutoSavedQuizState,
  ConceptualFeedback,
  LanguageCode,
  QuizAttemptRecord,
  QuizQuestion,
  TopicMastery,
} from "../types";
import { TranslationSet } from "../data/translations";
import {
  generateRuleBasedFeedback,
  selectAdaptiveDifficultyForMastery,
} from "../data/seedData";
import { AuthRepo } from "../db/repository";

interface SmartPracticeViewProps {
  userId: string;
  questions: QuizQuestion[];
  topics: TopicMastery[];
  selectedTopicId: string | null;
  onSelectTopicId: (id: string | null) => void;
  autoSavedQuiz: AutoSavedQuizState | null;
  onAutoSaveQuiz: (state: AutoSavedQuizState | null) => void;
  language: LanguageCode;
  t: TranslationSet;
  offlineFallbackOnly: boolean;
  onUpdateMastery: (topicId: string, delta: number) => void;
  onRecordFeedback: (feedback: ConceptualFeedback) => void;
  onRecordAttempt: (attempt: QuizAttemptRecord) => void;
  onSpeakText: (text: string) => void;
}

export const SmartPracticeView: React.FC<SmartPracticeViewProps> = ({
  userId,
  questions,
  topics,
  selectedTopicId,
  onSelectTopicId,
  autoSavedQuiz,
  onAutoSaveQuiz,
  language,
  t,
  offlineFallbackOnly,
  onUpdateMastery,
  onRecordFeedback,
  onRecordAttempt,
  onSpeakText,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [activeFeedback, setActiveFeedback] =
    useState<ConceptualFeedback | null>(null);
  const [followUpChoice, setFollowUpChoice] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(
    autoSavedQuiz?.savedAt || null
  );
  const restoredRef = useRef(false);
  const questionStartRef = useRef<number>(Date.now());

  const adaptiveQueue = useMemo(() => {
    const masteryMap = new Map(topics.map((tp) => [tp.id, tp.mastery]));
    const approvedPool = questions.filter((q) => q.approved_by_educator);
    const filtered = selectedTopicId
      ? approvedPool.filter((q) => q.topicId === selectedTopicId)
      : [...approvedPool];

    const pool = filtered.length > 0 ? filtered : approvedPool;
    const diffRank = { Easy: 0, Medium: 1, Hard: 2 };

    return [...pool].sort((a, b) => {
      const mA = masteryMap.get(a.topicId) ?? 50;
      const mB = masteryMap.get(b.topicId) ?? 50;
      const targetDiffA = selectAdaptiveDifficultyForMastery(mA);
      const targetDiffB = selectAdaptiveDifficultyForMastery(mB);
      const matchA = a.difficulty === targetDiffA ? 0 : 1;
      const matchB = b.difficulty === targetDiffB ? 0 : 1;

      if (selectedTopicId) {
        if (matchA !== matchB) return matchA - matchB;
        return diffRank[a.difficulty] - diffRank[b.difficulty];
      }

      if (mA !== mB) return mA - mB;
      if (matchA !== matchB) return matchA - matchB;
      return diffRank[a.difficulty] - diffRank[b.difficulty];
    });
  }, [questions, topics, selectedTopicId]);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (autoSavedQuiz) {
      const idx = adaptiveQueue.findIndex(
        (q) => q.id === autoSavedQuiz.questionId
      );
      if (idx >= 0) {
        setQuestionIndex(idx);
      }
      setSelectedOption(autoSavedQuiz.selectedOption);
      setCustomInput(autoSavedQuiz.customInput);
      setLastSavedTime(autoSavedQuiz.savedAt);
    }
  }, [autoSavedQuiz, adaptiveQueue]);

  const currentQuestion: QuizQuestion =
    adaptiveQueue[questionIndex % adaptiveQueue.length] || questions[0];

  const currentTopic = topics.find((tp) => tp.id === currentQuestion.topicId);
  const currentMastery = currentTopic?.mastery ?? 50;

  const localizedQuestion =
    language === "ur"
      ? currentQuestion.questionUr
      : language === "roman_ur"
      ? currentQuestion.questionRomanUr
      : currentQuestion.question;

  const persistDraftState = (nextSelected: string, nextCustom: string) => {
    const savedAt = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setLastSavedTime(savedAt);
    onAutoSaveQuiz({
      questionId: currentQuestion.id,
      topicId: selectedTopicId,
      selectedOption: nextSelected,
      customInput: nextCustom,
      savedAt,
    });
  };

  const submitEvaluation = async (answerToGrade: string) => {
    if (!answerToGrade.trim()) return;
    setFollowUpChoice(null);

    const elapsedMs = Math.max(500, Date.now() - questionStartRef.current);
    const isCorrect =
      answerToGrade.trim().toLowerCase() ===
      currentQuestion.correctAnswer.trim().toLowerCase();
    const masteryDelta = isCorrect ? 6 : 0;

    // 1. Instant grading & feedback with 0ms latency
    const initialPayload = generateRuleBasedFeedback({
      question: currentQuestion.question,
      codeSnippet: currentQuestion.codeSnippet,
      userAnswer: answerToGrade,
      correctAnswer: currentQuestion.correctAnswer,
      topic: currentQuestion.topicName,
      language,
    });

    const fullFeedback: ConceptualFeedback = {
      id: `fb-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      masteryDelta,
      ...initialPayload,
    };

    // Immediately display the result to the user without any lag
    setActiveFeedback(fullFeedback);
    onRecordFeedback(fullFeedback);
    if (isCorrect) {
      onUpdateMastery(currentQuestion.topicId, masteryDelta);
    }
    onRecordAttempt({
      id: `att-${Date.now()}`,
      user_id: userId,
      question_id: currentQuestion.id,
      topic_id: currentQuestion.topicId,
      topic_name: currentQuestion.topicName,
      selected_answer: answerToGrade,
      is_correct: isCorrect,
      response_time_ms: elapsedMs,
      created_at: new Date().toISOString(),
    });

    onAutoSaveQuiz(null);
    setLastSavedTime(null);
    setLoadingFeedback(false);

    // 2. Non-blocking background enhancement (optional AI enrichment)
    if (!offlineFallbackOnly) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);

      try {
        const token = AuthRepo.getToken();
        const res = await fetch("/api/ai/feedback", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            question: currentQuestion.question,
            codeSnippet: currentQuestion.codeSnippet,
            userAnswer: answerToGrade,
            correctAnswer: currentQuestion.correctAnswer,
            topic: currentQuestion.topicName,
            language,
          }),
        });
        clearTimeout(timer);
        if (res.ok) {
          const data = await res.json();
          if (data?.feedback) {
            setActiveFeedback((prev) =>
              prev
                ? {
                    ...prev,
                    source: "gemini",
                    whyOutcome: data.feedback.whyOutcome || prev.whyOutcome,
                    coreConcept: data.feedback.coreConcept || prev.coreConcept,
                    stepByStep: data.feedback.stepByStep || prev.stepByStep,
                    followUpQuestion:
                      data.feedback.followUpQuestion || prev.followUpQuestion,
                    followUpOptions:
                      data.feedback.followUpOptions || prev.followUpOptions,
                    followUpAnswer:
                      data.feedback.followUpAnswer || prev.followUpAnswer,
                  }
                : prev
            );
          }
        }
      } catch {
        // Fallback already displayed instantaneously
      }
    }
  };

  const handleNext = () => {
    setQuestionIndex((prev) => prev + 1);
    setSelectedOption("");
    setCustomInput("");
    setShowHint(false);
    setActiveFeedback(null);
    setFollowUpChoice(null);
    onAutoSaveQuiz(null);
    setLastSavedTime(null);
    questionStartRef.current = Date.now();
  };

  const handleFollowUpSelect = (choice: string) => {
    if (followUpChoice) return;
    setFollowUpChoice(choice);
    if (
      activeFeedback &&
      choice.trim().toLowerCase() ===
        activeFeedback.followUpAnswer.trim().toLowerCase()
    ) {
      onUpdateMastery(currentQuestion.topicId, 3);
    }
  };

  return (
    <div className="space-y-5">
      {/* Clean Header + Topic Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            {t.practiceTitle}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 hc-muted">
            {t.practiceSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              onSelectTopicId(null);
              setQuestionIndex(0);
              setActiveFeedback(null);
              setShowHint(false);
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
              selectedTopicId === null
                ? "bg-indigo-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            All Topics
          </button>

          {topics.map((tp) => {
            const active = selectedTopicId === tp.id;
            return (
              <button
                key={tp.id}
                type="button"
                onClick={() => {
                  onSelectTopicId(tp.id);
                  setQuestionIndex(0);
                  setActiveFeedback(null);
                  setSelectedOption("");
                  setCustomInput("");
                  setShowHint(false);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{tp.name}</span>
                <span
                  className={`tabular-nums text-[11px] font-bold ${
                    active ? "text-indigo-100" : "text-slate-400"
                  }`}
                >
                  {tp.mastery}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question + Conceptual Feedback Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="hc-card min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 lg:col-span-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Brain className="h-4 w-4 text-indigo-600 shrink-0" />
              <span className="font-bold text-slate-900">
                {currentQuestion.topicName}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentQuestion.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{currentMastery}%</span>
            </div>

            <div className="flex items-center gap-2">
              {lastSavedTime && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <Save className="h-3 w-3" />
                  Saved
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowHint((p) => !p)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span>{showHint ? "Hide hint" : "Hint"}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onSpeakText(
                    `${localizedQuestion}. ${currentQuestion.conceptHint}`
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Volume2 className="h-3.5 w-3.5 text-indigo-600" />
                <span>{t.readAloud}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-bold leading-snug text-slate-900">
              {localizedQuestion}
            </h2>

            {currentQuestion.codeSnippet && (
              <pre className="overflow-x-auto rounded-xl bg-[#0F172A] p-4 font-mono text-xs sm:text-sm leading-relaxed text-indigo-100">
                <code>{currentQuestion.codeSnippet}</code>
              </pre>
            )}

            {showHint && (
              <div className="rounded-xl bg-amber-50/70 px-3.5 py-2.5 text-xs text-amber-950">
                {currentQuestion.conceptHint}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedOption(opt);
                    setCustomInput(opt);
                    persistDraftState(opt, opt);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-start text-sm font-medium transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600"
                      : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-mono text-xs sm:text-sm break-words">
                    {opt}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 ms-2" />
                  )}
                </button>
              );
            })}
          </div>

          {currentQuestion.allowFreeInput && (
            <input
              id="free-answer-input"
              type="text"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                setSelectedOption(e.target.value);
                persistDraftState(e.target.value, e.target.value);
              }}
              placeholder="Or type exact output..."
              aria-label="Or type exact output"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={loadingFeedback || !(customInput || selectedOption)}
              onClick={() => submitEvaluation(customInput || selectedOption)}
              className="hc-btn-primary inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loadingFeedback ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t.submitAnswer}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>{t.nextQuestion}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="hc-card min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 lg:col-span-6 flex flex-col justify-between">
          {!activeFeedback ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center space-y-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {t.aiFeedbackTitle}
              </h3>
              <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                Submit your answer to view the detailed step-by-step breakdown and key concept summary.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {activeFeedback.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  )}
                  <span className="text-sm font-extrabold text-slate-900">
                    {activeFeedback.isCorrect
                      ? "Correct (+6% Mastery)"
                      : "Concept Clarification"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSpeakText(
                      `${activeFeedback.whyOutcome}. ${activeFeedback.coreConcept}`
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  aria-label="Read feedback aloud"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Listen</span>
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div
                  className={`rounded-xl p-4 ${
                    activeFeedback.isCorrect
                      ? "bg-emerald-50/70"
                      : "bg-amber-50/70"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-700 mb-1">
                    Why this outcome happened
                  </div>
                  <p className="text-xs leading-relaxed text-slate-800 sm:text-sm">
                    {activeFeedback.whyOutcome}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 space-y-2">
                  <div className="text-xs font-bold text-indigo-700">
                    Core Mental Model
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 sm:text-sm">
                    {activeFeedback.coreConcept}
                  </p>
                  <div className="pt-1 text-xs text-slate-600 font-mono">
                    {activeFeedback.stepByStep}
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-4 space-y-2.5">
                  <div className="text-xs font-bold text-indigo-900">
                    Follow-up Check (+3% bonus)
                  </div>
                  <p className="text-xs font-semibold text-slate-800 sm:text-sm">
                    {activeFeedback.followUpQuestion}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {activeFeedback.followUpOptions.map((opt) => {
                      const picked = followUpChoice === opt;
                      const isRight =
                        opt.trim().toLowerCase() ===
                        activeFeedback.followUpAnswer.trim().toLowerCase();
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleFollowUpSelect(opt)}
                          className={`rounded-lg border px-3 py-2 font-mono text-xs font-semibold transition-colors ${
                            followUpChoice
                              ? isRight
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                : picked
                                ? "border-rose-400 bg-rose-50 text-rose-800"
                                : "border-slate-200 bg-white text-slate-400"
                              : "border-slate-200 bg-white text-slate-800 hover:border-indigo-400"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {followUpChoice && (
                    <div className="text-xs font-semibold text-emerald-700">
                      {followUpChoice.trim().toLowerCase() ===
                      activeFeedback.followUpAnswer.trim().toLowerCase()
                        ? "Nailed it! +3% mastery added."
                        : `Correct output is ${activeFeedback.followUpAnswer}.`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
