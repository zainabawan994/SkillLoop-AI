import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartHandshake,
  ShieldCheck,
  X,
} from "lucide-react";
import { TopicMastery } from "../types";
import { DIAGNOSTIC_QUESTIONS, buildMicroSession } from "../data/seedData";

interface InactivityRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pythonProgress: number;
  topics: TopicMastery[];
  onApplyRecoveryPlan: (gaps: string[]) => void;
}

export const InactivityRecoveryModal: React.FC<InactivityRecoveryModalProps> = ({
  isOpen,
  onClose,
  pythonProgress,
  topics,
  onApplyRecoveryPlan,
}) => {
  const [step, setStep] = useState<"welcome" | "diagnostic" | "plan">(
    "welcome"
  );
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const currentQ = DIAGNOSTIC_QUESTIONS[qIdx];

  const handleAnswer = (opt: string) => {
    const updated = { ...answers, [currentQ.id]: opt };
    setAnswers(updated);
    if (qIdx < DIAGNOSTIC_QUESTIONS.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      setStep("plan");
    }
  };

  const detectedGaps = DIAGNOSTIC_QUESTIONS.filter(
    (q) => answers[q.id] !== q.correctAnswer
  ).map((q) => q.topicName);

  const finalGaps =
    detectedGaps.length > 0 ? detectedGaps : ["Loops", "Functions"];

  const catchUpSteps = buildMicroSession(10, topics, true);

  const handleLaunch = () => {
    onApplyRecoveryPlan(finalGaps);
    setStep("welcome");
    setQIdx(0);
    setAnswers({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recovery-modal-title"
    >
      <div className="hc-card w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Top Banner */}
        <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h2 id="recovery-modal-title" className="text-base font-bold">
                Welcome Back · 10-Minute Catch-Up Plan
              </h2>
              <p className="text-xs text-slate-300">
                Life happens! Your course progress is fully preserved.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === "welcome" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-emerald-950">
                      Your {pythonProgress}% Python Progress is 100% Preserved
                    </div>
                    <p className="text-xs text-emerald-800">
                      SkillLoop never resets your progress or penalizes you after busy weeks or work travel.
                    </p>
                  </div>
                </div>
                <span className="tabular-nums text-lg font-extrabold text-emerald-700">
                  {pythonProgress}% Kept
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Gentle 3-Question Warmup (Takes ~2 minutes)
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Let&apos;s quickly check what stayed fresh over the past 5 days and tune a lightweight 10-minute catch-up plan for tonight.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Maybe Later
                </button>
                <button
                  type="button"
                  onClick={() => setStep("diagnostic")}
                  className="hc-btn-primary inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  <span>Start Gentle Warmup</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === "diagnostic" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-indigo-700">
                  Warmup Question {qIdx + 1} of {DIAGNOSTIC_QUESTIONS.length}
                </span>
                <span>Topic: {currentQ.topicName}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {currentQ.question}
              </h3>

              {currentQ.codeSnippet && (
                <pre className="overflow-x-auto rounded-xl bg-[#0F172A] p-4 font-mono text-xs text-indigo-100">
                  <code>{currentQ.codeSnippet}</code>
                </pre>
              )}

              <div className="space-y-2">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(opt)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-start font-mono text-xs font-semibold text-slate-800 hover:border-indigo-500 hover:bg-indigo-50/60"
                  >
                    <span>{opt}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "plan" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>Key Topics Identified · Tailored 10-Min Catch-Up</span>
                </div>
                <p className="mt-1 text-xs text-indigo-800">
                  You retained strong recall on Variables! Priority practice for today:{" "}
                  <strong>{finalGaps.join(" & ")}</strong>. Your {pythonProgress}% course progress remains intact.
                </p>
              </div>

              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/60">
                {catchUpSteps.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {s.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {s.description}
                        </div>
                      </div>
                    </div>
                    <span className="tabular-nums flex items-center gap-1 text-xs font-bold text-indigo-700 whitespace-nowrap">
                      <Clock className="h-3.5 w-3.5" />
                      {s.minutes} min
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleLaunch}
                  className="hc-btn-primary inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <span>Apply 10-Min Recovery Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
