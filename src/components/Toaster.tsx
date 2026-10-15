"use client";

import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const TONES = {
  success: { icon: CheckCircle2, className: "text-emerald-600" },
  info: { icon: Info, className: "text-sky-600" },
  warning: { icon: AlertTriangle, className: "text-amber-600" },
};

export function Toaster() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((toast) => {
        const tone = TONES[toast.tone];
        const Icon = tone.icon;
        return (
          <div
            key={toast.id}
            className="animate-slide-in-right pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg"
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", tone.className)} />
            <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-300 transition-colors hover:text-slate-500"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
