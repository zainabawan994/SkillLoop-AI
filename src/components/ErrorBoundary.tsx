import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "Unexpected application error.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("SkillLoop UI ErrorBoundary caught:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F7FE] p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900">
              SkillLoop AI Recovery
            </h1>
            <p className="text-xs leading-relaxed text-slate-600">
              Your learning progress is safely saved locally. Reload to restore your active session.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
