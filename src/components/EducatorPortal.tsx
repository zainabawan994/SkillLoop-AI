import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Edit3,
  FileText,
  Loader2,
  Save,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DifficultyLevel, EducatorDraftItem } from "../types";
import {
  SIMULATED_30_LEARNERS,
  SIMULATED_COHORT_HEATMAP,
  SIMULATED_COHORT_WEEKLY,
  generateRuleBasedDrafts,
} from "../data/seedData";
import { AuthRepo } from "../db/repository";

interface EducatorPortalProps {
  drafts: EducatorDraftItem[];
  onAddDrafts: (newDrafts: EducatorDraftItem[]) => void;
  onUpdateDraftStatus: (
    id: string,
    status: "Approved" | "Rejected"
  ) => void;
  onEditDraft: (id: string, updated: Partial<EducatorDraftItem>) => void;
  offlineFallbackOnly: boolean;
  activeSubTab?: "generator" | "cohort";
  onSubTabChange?: (tab: "generator" | "cohort") => void;
}

const SAMPLE_LOOPS_NOTES = `Python Loops Lecture Notes:
1. A for-loop iterates over sequences like lists, strings, or range(start, stop, step).
2. range(5) produces 0, 1, 2, 3, 4 (stops before 5).
3. Always initialize accumulator variables like total = 0 outside the loop so values aren't overwritten each pass.
4. Use break to exit a loop early and continue to skip to the next iteration.`;

export const EducatorPortal: React.FC<EducatorPortalProps> = ({
  drafts,
  onAddDrafts,
  onUpdateDraftStatus,
  onEditDraft,
  offlineFallbackOnly,
  activeSubTab: controlledSubTab,
  onSubTabChange,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<"generator" | "cohort">(
    "generator"
  );
  const activeSubTab = controlledSubTab ?? internalSubTab;
  const setActiveSubTab = (tab: "generator" | "cohort") => {
    setInternalSubTab(tab);
    onSubTabChange?.(tab);
  };
  const [cohortCourseFilter, setCohortCourseFilter] = useState<string>("All");
  const [notes, setNotes] = useState(SAMPLE_LOOPS_NOTES);
  const [courseTitle, setCourseTitle] = useState("Python Programming");
  const [topicName, setTopicName] = useState("Loops");
  const [generating, setGenerating] = useState(false);
  const [extractedConcepts, setExtractedConcepts] = useState<string[]>([
    "range(start, stop) boundary semantics",
    "Accumulator initialization outside loop body",
    "Early exit with break vs skipping with continue",
  ]);
  const [genNotice, setGenNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editDifficulty, setEditDifficulty] =
    useState<DifficultyLevel>("Medium");

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    setGenerating(true);
    setGenNotice(null);

    let generated: {
      extractedConcepts: string[];
      drafts: Omit<EducatorDraftItem, "id" | "status" | "createdAt">[];
    } | null = null;

    if (!offlineFallbackOnly) {
      try {
        const token = AuthRepo.getToken();
        const res = await fetch("/api/ai/generate-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ notes, courseTitle, topicName }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.drafts) && data.drafts.length > 0) {
            generated = {
              extractedConcepts: data.extractedConcepts || [],
              drafts: data.drafts.map((d: Partial<EducatorDraftItem>) => ({
                courseTitle,
                topicName,
                question: d.question || "Draft question",
                codeSnippet: d.codeSnippet || "",
                options: d.options || [
                  "Option A",
                  "Option B",
                  "Option C",
                  "Option D",
                ],
                correctAnswer:
                  d.correctAnswer || (d.options?.[0] ?? "Option A"),
                difficulty:
                  d.difficulty === "Easy" ||
                  d.difficulty === "Medium" ||
                  d.difficulty === "Hard"
                    ? d.difficulty
                    : "Medium",
                explanation: d.explanation || "Conceptual explanation.",
              })),
            };
          }
        } else {
          setGenNotice(
            "Generated drafts locally because live AI is currently unavailable."
          );
        }
      } catch {
        setGenNotice(
          "Offline mode — generated draft questions locally for review."
        );
      }
    }

    if (!generated) {
      generated = generateRuleBasedDrafts(notes, courseTitle, topicName);
    }

    setExtractedConcepts(generated.extractedConcepts);
    const stampedDrafts: EducatorDraftItem[] = generated.drafts.map((d, i) => ({
      ...d,
      id: `draft-${Date.now()}-${i}`,
      status: "Pending Review",
      createdAt: "Just now",
    }));

    onAddDrafts(stampedDrafts);
    setGenerating(false);
  };

  const pendingCount = drafts.filter(
    (d) => d.status === "Pending Review"
  ).length;
  const approvedCount = drafts.filter((d) => d.status === "Approved").length;

  return (
    <div className="space-y-6">
      {/* Educator Header + Sub-tabs */}
      <div className="hc-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Educator Portal
          </h1>
          <p className="mt-1 text-xs text-slate-500 hc-muted">
            {activeSubTab === "generator"
              ? "Generate, review, and approve assessment items before learners see them."
              : "4-week cohort retention and mastery overview across 30 learners."}
          </p>
        </div>

        <div
          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1"
          role="group"
          aria-label="Educator sections"
        >
          <button
            type="button"
            onClick={() => setActiveSubTab("generator")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === "generator"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Content &amp; Queue ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("cohort")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === "cohort"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Cohort Analytics</span>
          </button>
        </div>
      </div>

      {activeSubTab === "generator" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Course Material Input */}
          <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Course Material
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Course
                </label>
                <select
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option>Python Programming</option>
                  <option>Data Science Basics</option>
                  <option>Web Development</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Target Topic
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Lecture Notes
              </label>
              <textarea
                rows={7}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="Paste course notes here..."
              />
            </div>

            <button
              type="button"
              disabled={generating}
              onClick={handleGenerate}
              className="hc-btn-primary flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Drafts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Draft Questions</span>
                </>
              )}
            </button>

            {genNotice && (
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                {genNotice}
              </div>
            )}

            <div className="border-t border-slate-100 pt-4">
              <div className="text-xs font-bold text-slate-700 mb-2">
                Extracted Key Concepts
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {extractedConcepts.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Approval Queue */}
          <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Approval Queue
                </h2>
                <p className="text-xs text-slate-500">
                  {pendingCount} pending review · {approvedCount} approved
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {drafts.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <div
                    key={item.id}
                    className="py-5 first:pt-0 last:pb-0 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-bold text-slate-900">
                          {item.topicName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-bold ${
                            item.difficulty === "Easy"
                              ? "text-emerald-700"
                              : item.difficulty === "Medium"
                              ? "text-indigo-700"
                              : "text-amber-700"
                          }`}
                        >
                          {item.difficulty}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.createdAt}</span>
                      </div>

                      <span
                        className={`text-xs font-bold ${
                          item.status === "Approved"
                            ? "text-emerald-700"
                            : item.status === "Rejected"
                            ? "text-rose-700"
                            : "text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 rounded-xl bg-slate-50 p-3.5">
                        <input
                          type="text"
                          value={editQuestionText}
                          onChange={(e) => setEditQuestionText(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <select
                            value={editDifficulty}
                            onChange={(e) =>
                              setEditDifficulty(
                                e.target.value as DifficultyLevel
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onEditDraft(item.id, {
                                  question: editQuestionText,
                                  difficulty: editDifficulty,
                                });
                                setEditingId(null);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white"
                            >
                              <Save className="h-3.5 w-3.5" />
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-bold text-slate-900">
                          {item.question}
                        </div>
                        {item.codeSnippet && (
                          <pre className="overflow-x-auto rounded-xl bg-[#0F172A] p-3 font-mono text-xs text-indigo-100">
                            <code>{item.codeSnippet}</code>
                          </pre>
                        )}
                        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                          {item.options.map((opt) => (
                            <div
                              key={opt}
                              className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${
                                opt === item.correctAnswer
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold"
                                  : "border-slate-200 bg-slate-50/70 text-slate-600"
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-600">
                          <strong>Rationale:</strong> {item.explanation}
                        </p>
                      </>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditQuestionText(item.question);
                          setEditDifficulty(item.difficulty);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateDraftStatus(item.id, "Rejected")}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateDraftStatus(item.id, "Approved")}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve &amp; Publish</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Cohort Analytics Tab */
        <div className="space-y-6">
          {/* 4 Cohort KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="text-xs font-semibold text-slate-500">
                Cohort Mastery Growth
              </div>
              <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
                35% → 72%
              </div>
              <div className="mt-1 text-xs font-semibold text-emerald-700">
                +37 pts over 4 weeks
              </div>
            </div>
            <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="text-xs font-semibold text-slate-500">
                Quiz Accuracy Lift
              </div>
              <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
                42% → 76%
              </div>
              <div className="mt-1 text-xs font-semibold text-blue-700">
                +34 pts conceptual accuracy
              </div>
            </div>
            <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="text-xs font-semibold text-slate-500">
                Active Practice Completion
              </div>
              <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
                25 / 30 Learners
              </div>
              <div className="mt-1 text-xs font-semibold text-indigo-700">
                83.3% weekly persistence
              </div>
            </div>
            <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="text-xs font-semibold text-slate-500">
                4-Week Delayed Retention
              </div>
              <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
                71% Avg
              </div>
              <div className="mt-1 text-xs font-semibold text-emerald-700">
                Verified at Week 4
              </div>
            </div>
          </div>

          {/* Cohort Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-6 lg:col-span-7">
              <h3 className="text-base font-bold text-slate-900">
                4-Week Mastery &amp; Quiz Accuracy
              </h3>
              <p className="text-xs text-slate-500">
                Weekly progression checkpoints
              </p>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={SIMULATED_COHORT_WEEKLY}
                    margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis domain={[20, 90]} unit="%" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="mastery"
                      name="Mastery %"
                      stroke="#4F46E5"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      name="Quiz Accuracy %"
                      stroke="#059669"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="retentionScore"
                      name="Retention Check %"
                      stroke="#D97706"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-6 lg:col-span-5">
              <h3 className="text-base font-bold text-slate-900">
                Active Learners (Out of 30)
              </h3>
              <p className="text-xs text-slate-500">
                Weekly micro-session adoption
              </p>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={SIMULATED_COHORT_WEEKLY}
                    margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 30]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey="activeLearners"
                      name="Active Learners"
                      fill="#4F46E5"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Weak-Topic Heatmap */}
          <div className="hc-card overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6">
            <h3 className="text-base font-bold text-slate-900">
              Topic Mastery Heatmap
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Average cohort mastery (%) across 4 weeks and delayed retention check
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 pe-4 font-semibold">Topic</th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Week 1
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Week 2
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Week 3
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Week 4
                    </th>
                    <th className="py-2.5 ps-3 font-semibold text-right">
                      Delayed Retention
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SIMULATED_COHORT_HEATMAP.map((row) => {
                    const cellColor = (val: number) =>
                      val >= 75
                        ? "bg-emerald-50 text-emerald-800"
                        : val >= 50
                        ? "bg-indigo-50 text-indigo-800"
                        : "bg-amber-50 text-amber-800";

                    return (
                      <tr key={row.topic}>
                        <td className="py-3 pe-4 font-bold text-slate-900">
                          {row.topic}
                        </td>
                        {[row.week1, row.week2, row.week3, row.week4].map(
                          (val, idx) => (
                            <td key={idx} className="py-2 px-1.5 text-right">
                              <span
                                className={`tabular-nums inline-block rounded-lg px-3 py-1.5 font-bold ${cellColor(
                                  val
                                )}`}
                              >
                                {val}%
                              </span>
                            </td>
                          )
                        )}
                        <td className="py-2 ps-3 text-right">
                          <span className="tabular-nums font-extrabold text-slate-900">
                            {row.retentionCheck}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 30-Learner Roster */}
          <div className="hc-card overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Learner Roster (30 Learners)
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Progression across courses and flexible study schedules
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
                {[
                  "All",
                  "Python Programming",
                  "Data Science Basics",
                  "Web Development",
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCohortCourseFilter(c)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      cohortCourseFilter === c
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {c === "All" ? "All (30)" : c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 max-h-80 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 pe-3 font-semibold">Learner</th>
                    <th className="py-2.5 px-3 font-semibold">Schedule</th>
                    <th className="py-2.5 px-3 font-semibold">Course</th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Wk 1
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Wk 4
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-right">
                      Accuracy
                    </th>
                    <th className="py-2.5 ps-3 font-semibold text-right">
                      Retention
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SIMULATED_30_LEARNERS.filter(
                    (l) =>
                      cohortCourseFilter === "All" ||
                      l.course === cohortCourseFilter
                  ).map((learner) => (
                    <tr key={learner.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 pe-3 font-bold text-slate-900 whitespace-nowrap">
                        {learner.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {learner.scheduleType}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {learner.course}
                      </td>
                      <td className="tabular-nums py-2.5 px-3 text-right text-slate-500">
                        {learner.week1Mastery}%
                      </td>
                      <td className="tabular-nums py-2.5 px-3 text-right font-bold text-emerald-700">
                        {learner.week4Mastery}%
                      </td>
                      <td className="tabular-nums py-2.5 px-3 text-right font-semibold text-indigo-700">
                        {learner.quizAccuracy}%
                      </td>
                      <td className="tabular-nums py-2.5 ps-3 text-right font-bold text-slate-900">
                        {learner.delayedRetention}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
