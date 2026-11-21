import React from "react";
import {
  Activity,
  BookOpen,
  Cpu,
  Globe,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RecoveryLogEntry } from "../types";
import { ADMIN_LANGUAGE_USAGE } from "../data/seedData";

interface AdminDashboardProps {
  logs: RecoveryLogEntry[];
  approvedDraftsCount: number;
  feedbackCount: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  logs,
  approvedDraftsCount,
  feedbackCount,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Admin Operations
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 hc-muted">
          Platform learner activity, language distribution, and recovery logs.
        </p>
      </div>

      {/* 4 Clean Platform KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Learners</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
            763
          </div>
        </div>

        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Approved Items</span>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
            {approvedDraftsCount}
          </div>
        </div>

        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>AI Feedback Calls</span>
            <Cpu className="h-4 w-4 text-violet-600" />
          </div>
          <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
            {4820 + feedbackCount}
          </div>
        </div>

        <div className="hc-card rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Recoveries</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 tabular-nums text-2xl font-extrabold text-slate-900">
            148
          </div>
        </div>
      </div>

      {/* Language Breakdown + Recovery Logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="hc-card min-w-0 rounded-2xl border border-slate-200/80 bg-white p-6 lg:col-span-5">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Language Distribution
            </h2>
          </div>

          <div className="mt-4 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ADMIN_LANGUAGE_USAGE}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 20, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  unit="%"
                  domain={[0, 70]}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar
                  dataKey="share"
                  name="Share (%)"
                  fill="#4F46E5"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hc-card min-w-0 rounded-2xl border border-slate-200/80 bg-white p-6 lg:col-span-7">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Recovery Logs
            </h2>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pe-3 font-semibold">Time</th>
                  <th className="py-2 px-3 font-semibold">Event</th>
                  <th className="py-2 ps-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="align-top">
                    <td className="tabular-nums py-3 pe-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{log.event}</div>
                      <div className="mt-0.5 text-slate-500">{log.detail}</div>
                    </td>
                    <td className="py-3 ps-3 whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          log.severity === "Resolved"
                            ? "text-emerald-700"
                            : log.severity === "Fallback Active"
                            ? "text-amber-700"
                            : "text-indigo-700"
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
