import { NavTab, UserRole } from "../types";

export interface AppRouteState {
  portal: UserRole;
  learnerTab: NavTab;
  educatorSubTab: "generator" | "cohort";
  path: string;
}

const LEARNER_TAB_TO_PATH: Record<NavTab, string> = {
  dashboard: "/dashboard",
  courses: "/courses",
  practice: "/practice",
  planner: "/planner",
  progress: "/progress",
  feedback: "/feedback",
  resources: "/resources",
  settings: "/settings",
};

const PATH_TO_LEARNER_TAB: Record<string, NavTab> = {
  "/dashboard": "dashboard",
  "/courses": "courses",
  "/practice": "practice",
  "/planner": "planner",
  "/progress": "progress",
  "/feedback": "feedback",
  "/resources": "resources",
  "/settings": "settings",
};

export function normalizePathname(rawPath: string): string {
  const cleaned = rawPath.split("?")[0].split("#")[0].replace(/\/+$/, "");
  return cleaned === "" ? "/" : cleaned.toLowerCase();
}

export function getAllowedRolesForUser(userRole?: UserRole): UserRole[] {
  if (userRole === "admin") return ["learner", "educator", "admin"];
  if (userRole === "educator") return ["educator"];
  return ["learner"];
}

export function getDefaultPathForRole(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "educator") return "/educator";
  return "/dashboard";
}

export function routeStateToPath(state: {
  portal: UserRole;
  learnerTab: NavTab;
  educatorSubTab: "generator" | "cohort";
}): string {
  if (state.portal === "admin") return "/admin";
  if (state.portal === "educator") {
    return state.educatorSubTab === "cohort" ? "/educator/cohort" : "/educator";
  }
  return LEARNER_TAB_TO_PATH[state.learnerTab] || "/dashboard";
}

export interface RouteEvaluation {
  isAuthenticatedRoute: boolean;
  allowed: boolean;
  isNotFound: boolean;
  redirectPath: string | null;
  deniedReason: string | null;
  resolved: AppRouteState;
}

export function evaluateRouteAccess(
  rawPath: string,
  userRole: UserRole | null
): RouteEvaluation {
  const path = normalizePathname(rawPath);

  // 0. Unknown / broken URL guard -> show real 404 state (do not silently mask broken URLs)
  const isKnown =
    path === "/" ||
    path === "/login" ||
    path === "/admin" ||
    path === "/educator" ||
    path === "/educator/cohort" ||
    Boolean(PATH_TO_LEARNER_TAB[path]);

  if (!isKnown) {
    return {
      isAuthenticatedRoute: false,
      allowed: false,
      isNotFound: true,
      redirectPath: null,
      deniedReason: null,
      resolved: {
        portal: userRole || "learner",
        learnerTab: "dashboard",
        educatorSubTab: "generator",
        path,
      },
    };
  }

  // 1. Unauthenticated visitor guard -> force /login
  if (!userRole) {
    return {
      isAuthenticatedRoute: path !== "/login" && path !== "/",
      allowed: path === "/login" || path === "/",
      isNotFound: false,
      redirectPath: path === "/login" ? null : "/login",
      deniedReason:
        path !== "/login" && path !== "/"
          ? "Please sign in to access that route."
          : null,
      resolved: {
        portal: "learner",
        learnerTab: "dashboard",
        educatorSubTab: "generator",
        path: "/login",
      },
    };
  }

  const allowedPortals = getAllowedRolesForUser(userRole);
  const fallbackPath = getDefaultPathForRole(userRole);

  // 2. Visiting / or /login -> show Sign In page
  if (path === "/" || path === "/login") {
    return {
      isAuthenticatedRoute: false,
      allowed: true,
      isNotFound: false,
      redirectPath: path === "/login" ? null : "/login",
      deniedReason: null,
      resolved: {
        portal: userRole || "learner",
        learnerTab: "dashboard",
        educatorSubTab: "generator",
        path: "/login",
      },
    };
  }

  // 3. Admin route guard (/admin)
  if (path === "/admin") {
    if (!allowedPortals.includes("admin")) {
      return {
        isAuthenticatedRoute: true,
        allowed: false,
        isNotFound: false,
        redirectPath: fallbackPath,
        deniedReason:
          "Access denied: Admin routes are restricted to Admin accounts.",
        resolved: {
          portal: userRole,
          learnerTab: "dashboard",
          educatorSubTab: "generator",
          path: fallbackPath,
        },
      };
    }
    return {
      isAuthenticatedRoute: true,
      allowed: true,
      isNotFound: false,
      redirectPath: null,
      deniedReason: null,
      resolved: {
        portal: "admin",
        learnerTab: "dashboard",
        educatorSubTab: "generator",
        path: "/admin",
      },
    };
  }

  // 4. Educator routes guard (/educator, /educator/cohort)
  if (path === "/educator" || path === "/educator/cohort") {
    if (!allowedPortals.includes("educator")) {
      return {
        isAuthenticatedRoute: true,
        allowed: false,
        isNotFound: false,
        redirectPath: fallbackPath,
        deniedReason:
          "Access denied: Educator routes are restricted to Educator and Admin accounts.",
        resolved: {
          portal: userRole,
          learnerTab: "dashboard",
          educatorSubTab: "generator",
          path: fallbackPath,
        },
      };
    }
    const subTab = path === "/educator/cohort" ? "cohort" : "generator";
    return {
      isAuthenticatedRoute: true,
      allowed: true,
      isNotFound: false,
      redirectPath: null,
      deniedReason: null,
      resolved: {
        portal: "educator",
        learnerTab: "dashboard",
        educatorSubTab: subTab,
        path,
      },
    };
  }

  // 5. Learner routes guard (/dashboard, /courses, /practice, /planner, /progress, /feedback, /resources, /settings)
  const matchedLearnerTab = PATH_TO_LEARNER_TAB[path];
  if (matchedLearnerTab) {
    if (!allowedPortals.includes("learner")) {
      return {
        isAuthenticatedRoute: true,
        allowed: false,
        isNotFound: false,
        redirectPath: fallbackPath,
        deniedReason:
          "Access denied: Learner routes are restricted to Learner and Admin accounts.",
        resolved: {
          portal: userRole,
          learnerTab: "dashboard",
          educatorSubTab: "generator",
          path: fallbackPath,
        },
      };
    }
    return {
      isAuthenticatedRoute: true,
      allowed: true,
      isNotFound: false,
      redirectPath: null,
      deniedReason: null,
      resolved: {
        portal: "learner",
        learnerTab: matchedLearnerTab,
        educatorSubTab: "generator",
        path,
      },
    };
  }

  // 6. Unknown route -> redirect cleanly to user's authorized home
  return {
    isAuthenticatedRoute: true,
    allowed: false,
    isNotFound: false,
    redirectPath: fallbackPath,
    deniedReason: null,
    resolved: {
      portal: userRole,
      learnerTab: "dashboard",
      educatorSubTab: "generator",
      path: fallbackPath,
    },
  };
}
