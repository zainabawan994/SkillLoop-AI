import React from "react";
import {
  BookOpen,
  Brain,
  CalendarClock,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  PenTool,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { LanguageCode, NavTab, UserRole } from "../types";
import { TranslationSet } from "../data/translations";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  role: UserRole;
  allowedRoles: UserRole[];
  onRoleChange: (role: UserRole) => void;
  educatorSubTab: "generator" | "cohort";
  onSelectEducatorSubTab: (tab: "generator" | "cohort") => void;
  language: LanguageCode;
  onOpenTutor: () => void;
  t: TranslationSet;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const LEARNER_NAV_ITEMS: {
  id: NavTab;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "courses", icon: BookOpen },
  { id: "practice", icon: Brain },
  { id: "planner", icon: CalendarClock },
  { id: "settings", icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  role,
  allowedRoles,
  onRoleChange,
  educatorSubTab,
  onSelectEducatorSubTab,
  language,
  onOpenTutor,
  t,
  mobileOpen,
  onCloseMobile,
}) => {
  const handleLearnerNavClick = (tab: NavTab) => {
    if (!allowedRoles.includes("learner")) return;
    if (role !== "learner") {
      onRoleChange("learner");
    }
    onSelectTab(tab);
    onCloseMobile();
  };

  const handleEducatorNavClick = (subTab: "generator" | "cohort") => {
    if (!allowedRoles.includes("educator")) return;
    if (role !== "educator") {
      onRoleChange("educator");
    }
    onSelectEducatorSubTab(subTab);
    onCloseMobile();
  };

  const handleBrandClick = () => {
    if (role === "learner" && allowedRoles.includes("learner")) {
      onSelectTab("dashboard");
    } else if (role === "educator" && allowedRoles.includes("educator")) {
      onSelectEducatorSubTab("generator");
    }
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`hc-sidebar fixed inset-y-0 start-0 z-50 flex w-[232px] shrink-0 flex-col bg-[#0F172A] text-slate-100 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : language === "ur"
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label="Primary Sidebar"
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
          <a
            href={
              role === "admin"
                ? "/admin"
                : role === "educator"
                ? "/educator"
                : "/dashboard"
            }
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleBrandClick();
              }
            }}
            className="flex items-center gap-2.5 text-start focus-visible:outline-2 focus-visible:outline-indigo-400 rounded-lg"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
            <span className="text-[16px] font-bold tracking-tight text-white whitespace-nowrap">
              SkillLoop
            </span>
          </a>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role-Scoped Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {role === "learner" && (
            <nav className="space-y-1" aria-label="Learner navigation">
              {LEARNER_NAV_ITEMS.map(({ id, icon: Icon }) => {
                const isActive = activeTab === id;
                const href = `/${id}`;
                return (
                  <a
                    key={id}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                        e.preventDefault();
                        handleLearnerNavClick(id);
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                      isActive
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t.nav[id]}</span>
                  </a>
                );
              })}
            </nav>
          )}

          {role === "educator" && (
            <nav className="space-y-1" aria-label="Educator navigation">
              <a
                href="/educator"
                aria-current={educatorSubTab === "generator" ? "page" : undefined}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    handleEducatorNavClick("generator");
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap ${
                  educatorSubTab === "generator"
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <PenTool className="h-4 w-4 shrink-0" />
                <span className="truncate">Content &amp; Queue</span>
              </a>
              <a
                href="/educator/cohort"
                aria-current={educatorSubTab === "cohort" ? "page" : undefined}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    handleEducatorNavClick("cohort");
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap ${
                  educatorSubTab === "cohort"
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span className="truncate">Cohort Analytics</span>
              </a>
            </nav>
          )}

          {role === "admin" && (
            <nav className="space-y-1" aria-label="Admin navigation">
              <a
                href="/admin"
                aria-current="page"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onRoleChange("admin");
                    onCloseMobile();
                  }
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-[13px] font-semibold text-white whitespace-nowrap"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="truncate">Operations</span>
              </a>

              {allowedRoles.includes("educator") && (
                <a
                  href="/educator"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onRoleChange("educator");
                      onCloseMobile();
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white whitespace-nowrap"
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="truncate">Educator Portal</span>
                </a>
              )}

              {allowedRoles.includes("learner") && (
                <a
                  href="/dashboard"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onRoleChange("learner");
                      onSelectTab("dashboard");
                      onCloseMobile();
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white whitespace-nowrap"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <span className="truncate">Learner Portal</span>
                </a>
              )}
            </nav>
          )}
        </div>

        {/* Clean Study Assistant Trigger */}
        <div className="border-t border-slate-800/80 p-3.5">
          <button
            type="button"
            onClick={() => {
              onOpenTutor();
              onCloseMobile();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700/80 px-3.5 py-2.5 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-700 hover:text-white whitespace-nowrap shadow-xs"
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
            <span>Study Assistant</span>
          </button>
        </div>
      </aside>
    </>
  );
};
