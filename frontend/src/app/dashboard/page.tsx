import type { Metadata } from "next";
import { Activity, Clock, PhoneCall, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CallVolumeChart } from "@/components/dashboard/CallVolumeChart";
import { SentimentChart } from "@/components/dashboard/SentimentChart";
import { StatusBreakdownChart } from "@/components/dashboard/StatusBreakdownChart";
import { DirectionChart } from "@/components/dashboard/DirectionChart";
import { RecentCallsTable } from "@/components/dashboard/RecentCallsTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "./RefreshButton";
import { formatDuration } from "@/lib/utils";
import type { MockCallsResponse } from "@/types";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Real-time call metrics and performance overview for Call Bank operations.",
};

export const dynamic = "force-dynamic";

async function getMockCallData(): Promise<MockCallsResponse | null> {
  const apiUrl = process.env.API_URL ?? "http://localhost:8000/api";
  try {
    const res = await fetch(`${apiUrl}/mock-data?count=100`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const EMPTY_SUMMARY: MockCallsResponse["summary"] = {
  by_status: {
    completed: 0,
    no_answer: 0,
    busy: 0,
    voicemail: 0,
    failed: 0,
    in_progress: 0,
    pending: 0,
    initiated: 0,
  },
  by_sentiment: { positive: 0, neutral: 0, negative: 0, mixed: 0 },
  by_direction: { inbound: 0, outbound: 0 },
  avg_duration_seconds: 0,
  total_duration_seconds: 0,
  total_cost_credits: 0,
  completion_rate: 0,
};

export default async function DashboardPage() {
  const data = await getMockCallData();
  const summary = data?.summary ?? EMPTY_SUMMARY;
  const calls = data?.calls ?? [];

  const avgDuration = formatDuration(Math.round(summary.avg_duration_seconds));
  const completionRate = `${summary.completion_rate.toFixed(1)}%`;
  const totalCredits = `${summary.total_cost_credits.toFixed(2)} cr`;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Real-time performance overview for Call Bank operations"
        actions={<RefreshButton />}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <MetricCard
          label="Total Calls"
          value={data?.total_calls ?? 0}
          icon={PhoneCall}
          accent="indigo"
          sub="this period"
        />
        <MetricCard
          label="Avg Duration"
          value={avgDuration}
          icon={Clock}
          accent="emerald"
          sub="per call"
        />
        <MetricCard
          label="Completion Rate"
          value={completionRate}
          icon={TrendingUp}
          accent="amber"
          sub="of all calls"
        />
        <MetricCard
          label="Total Cost"
          value={totalCredits}
          icon={Activity}
          accent="rose"
          sub="credits used"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
        <CallVolumeChart calls={calls} />
        <SentimentChart summary={summary} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
        <StatusBreakdownChart summary={summary} />
        <DirectionChart summary={summary} />
      </div>

      <RecentCallsTable calls={calls} />
    </div>
  );
}
