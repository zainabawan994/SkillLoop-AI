export interface RouteSeoMeta {
  path: string;
  title: string;
  description: string;
  priority: string;
  changefreq: string;
  indexable: boolean;
}

export const SITE_NAME = "SkillLoop";

export const ROUTE_SEO_MAP: Record<string, RouteSeoMeta> = {
  "/": {
    path: "/",
    title: "SkillLoop – Modern Interactive Learning Platform",
    description:
      "Master programming with focused 10–30 minute daily sessions, personalized practice, and clear step-by-step explanations.",
    priority: "1.0",
    changefreq: "weekly",
    indexable: true,
  },
  "/login": {
    path: "/login",
    title: "Sign In – SkillLoop",
    description:
      "Sign in or create a SkillLoop account to access daily study plans, focused practice, and personalized tracking.",
    priority: "0.9",
    changefreq: "monthly",
    indexable: true,
  },
  "/dashboard": {
    path: "/dashboard",
    title: "Learner Dashboard – SkillLoop",
    description:
      "Track topic mastery, resume micro-lessons, and follow flexible daily study plans built for working adult learners.",
    priority: "0.9",
    changefreq: "daily",
    indexable: true,
  },
  "/courses": {
    path: "/courses",
    title: "My Courses & Micro-Lessons – SkillLoop",
    description:
      "Explore bite-sized programming micro-lessons with interactive code examples, captions, and audio playback in SkillLoop.",
    priority: "0.9",
    changefreq: "weekly",
    indexable: true,
  },
  "/practice": {
    path: "/practice",
    title: "Targeted Practice & Explanations – SkillLoop",
    description:
      "Practice coding questions with targeted difficulty, auto-saved quiz progress, and step-by-step conceptual explanations.",
    priority: "0.9",
    changefreq: "daily",
    indexable: true,
  },
  "/planner": {
    path: "/planner",
    title: "Daily Study Planner – SkillLoop",
    description:
      "Build a realistic 10, 15, 20, or 30-minute study session around your schedule and stay on track without streak penalties.",
    priority: "0.8",
    changefreq: "weekly",
    indexable: true,
  },
  "/progress": {
    path: "/progress",
    title: "My Progress & Mastery – SkillLoop AI",
    description:
      "Monitor weekly mastery growth, quiz accuracy, and topic-level retention health across Python, Data Science, and Web courses.",
    priority: "0.8",
    changefreq: "weekly",
    indexable: true,
  },
  "/feedback": {
    path: "/feedback",
    title: "AI Feedback History – SkillLoop AI",
    description:
      "Review saved conceptual explanations, step-by-step code traces, and misconception clarifications from past practice sessions.",
    priority: "0.7",
    changefreq: "weekly",
    indexable: true,
  },
  "/resources": {
    path: "/resources",
    title: "Quick Reference Sheets – SkillLoop AI",
    description:
      "Browse concise programming cheat sheets for data types, loops, and functions to reinforce core concepts before practice.",
    priority: "0.8",
    changefreq: "monthly",
    indexable: true,
  },
  "/settings": {
    path: "/settings",
    title: "Accessibility & Settings – SkillLoop AI",
    description:
      "Customize English, Urdu, or Roman Urdu language, larger text, high contrast mode, audio narration, and offline practice.",
    priority: "0.6",
    changefreq: "monthly",
    indexable: true,
  },
  "/educator": {
    path: "/educator",
    title: "Educator Portal & AI Queue – SkillLoop AI",
    description:
      "Generate scaffolded assessment drafts from lecture notes and review, edit, or approve every question before learners see it.",
    priority: "0.8",
    changefreq: "weekly",
    indexable: true,
  },
  "/educator/cohort": {
    path: "/educator/cohort",
    title: "Cohort Analytics – SkillLoop AI Educator",
    description:
      "Analyze 4-week cohort mastery growth, delayed retention scores, and weak-topic heatmaps across active adult learners.",
    priority: "0.7",
    changefreq: "weekly",
    indexable: true,
  },
  "/admin": {
    path: "/admin",
    title: "Admin Operations & Audit – SkillLoop AI",
    description:
      "Inspect platform learner engagement, language distribution, recovery engine logs, and authentication security status in real time.",
    priority: "0.6",
    changefreq: "daily",
    indexable: true,
  },
};

export const NOT_FOUND_SEO: RouteSeoMeta = {
  path: "/404",
  title: "Page Not Found (404) – SkillLoop AI",
  description:
    "The requested SkillLoop AI page could not be found. Return to the learner dashboard, courses, practice, or sign-in page.",
  priority: "0.0",
  changefreq: "never",
  indexable: false,
};

export const KNOWN_APP_PATHS = Object.keys(ROUTE_SEO_MAP);

export function normalizeSeoPath(rawPath: string): string {
  const cleaned = rawPath.split("?")[0].split("#")[0].replace(/\/+$/, "");
  return cleaned === "" ? "/" : cleaned.toLowerCase();
}

export function isKnownAppRoute(rawPath: string): boolean {
  const path = normalizeSeoPath(rawPath);
  return Object.prototype.hasOwnProperty.call(ROUTE_SEO_MAP, path);
}

export function getRouteSeoMeta(rawPath: string, isNotFound = false): RouteSeoMeta {
  if (isNotFound) return NOT_FOUND_SEO;
  const path = normalizeSeoPath(rawPath);
  return ROUTE_SEO_MAP[path] || NOT_FOUND_SEO;
}

function upsertMetaTag(
  attr: "name" | "property",
  key: string,
  content: string
): void {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function applyClientRouteSeo(rawPath: string, isNotFound = false): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const meta = getRouteSeoMeta(rawPath, isNotFound);
  const normalizedPath = normalizeSeoPath(rawPath);
  const canonicalUrl = `${window.location.origin}${
    normalizedPath === "/" ? "/" : normalizedPath
  }`;

  document.title = meta.title;
  upsertMetaTag("name", "description", meta.description);
  upsertMetaTag("property", "og:title", meta.title);
  upsertMetaTag("property", "og:description", meta.description);
  upsertMetaTag("property", "og:url", canonicalUrl);
  upsertMetaTag("property", "og:site_name", SITE_NAME);
  upsertMetaTag("name", "twitter:title", meta.title);
  upsertMetaTag("name", "twitter:description", meta.description);

  if (isNotFound) {
    upsertMetaTag("name", "robots", "noindex, nofollow");
  }

  let canonicalLink = document.head.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute("href", canonicalUrl);
}
