import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CallStatus, Sentiment } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function formatCredits(credits: number): string {
  return credits.toFixed(2);
}

const STATUS_STYLES: Record<CallStatus, string> = {
  completed: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25",
  in_progress: "bg-blue-500/15 text-blue-400 ring-blue-500/25",
  initiated: "bg-blue-500/15 text-blue-400 ring-blue-500/25",
  simulated: "bg-slate-500/15 text-slate-400 ring-slate-500/25",
  failed: "bg-red-500/15 text-red-400 ring-red-500/25",
  no_answer: "bg-amber-500/15 text-amber-400 ring-amber-500/25",
  busy: "bg-orange-500/15 text-orange-400 ring-orange-500/25",
  voicemail: "bg-purple-500/15 text-purple-400 ring-purple-500/25",
  pending: "bg-slate-500/15 text-slate-400 ring-slate-500/25",
};

export function statusStyle(status: CallStatus): string {
  return STATUS_STYLES[status] ?? STATUS_STYLES.pending;
}

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  positive: "bg-emerald-500/15 text-emerald-400",
  neutral: "bg-slate-500/15 text-slate-400",
  negative: "bg-red-500/15 text-red-400",
  mixed: "bg-amber-500/15 text-amber-400",
};

export function sentimentStyle(sentiment: Sentiment): string {
  return SENTIMENT_STYLES[sentiment] ?? SENTIMENT_STYLES.neutral;
}

export const TOOLTIP_PROPS = {
  contentStyle: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 10,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
    padding: "10px 14px",
  },
  labelStyle: {
    color: "#f1f5f9",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
  },
  itemStyle: {
    color: "#94a3b8",
    fontSize: 12,
  },
  cursor: { fill: "rgba(148,163,184,0.05)" },
} as const;

export const CHART_COLORS = {
  positive: "#10b981",
  neutral: "#94a3b8",
  negative: "#f87171",
  mixed: "#fbbf24",
  completed: "#10b981",
  failed: "#f87171",
  no_answer: "#fbbf24",
  busy: "#fb923c",
  voicemail: "#a78bfa",
  in_progress: "#60a5fa",
  inbound: "#818cf8",
  outbound: "#38bdf8",
  primary: "#818cf8",
  secondary: "#38bdf8",
  accent: "#a78bfa",
};

export function groupCallsByDay(calls: { started_at: string }[]) {
  const map = new Map<string, number>();
  for (const call of calls) {
    const day = call.started_at.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function groupByHour(calls: { started_at: string }[]) {
  const map = new Map<number, number>();
  for (let h = 0; h < 24; h++) map.set(h, 0);
  for (const call of calls) {
    const h = new Date(call.started_at).getUTCHours();
    map.set(h, (map.get(h) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([hour, count]) => ({ hour, count }));
}
