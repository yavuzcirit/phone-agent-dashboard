import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { TopicsBarChart } from "@/components/analytics/TopicsBarChart";
import { OutcomeChart } from "@/components/analytics/OutcomeChart";
import { DurationHistogram } from "@/components/analytics/DurationHistogram";
import { HourlyHeatmap } from "@/components/analytics/HourlyHeatmap";
import { TagsChart } from "@/components/analytics/TagsChart";
import { SentimentScoreChart } from "@/components/analytics/SentimentScoreChart";
import { AgentTable } from "@/components/analytics/AgentTable";
import { RefreshButton } from "../dashboard/RefreshButton";
import type { MockCallsResponse } from "@/types";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Deep-dive analytics on call topics, outcomes, durations, and agent performance for Call Bank.",
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

export default async function AnalyticsPage() {
  const data = await getMockCallData();
  const calls = data?.calls ?? [];

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Deep-dive breakdowns across topics, outcomes, durations, and agent performance"
        actions={<RefreshButton />}
      />

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TopicsBarChart calls={calls} />
          <OutcomeChart calls={calls} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <HourlyHeatmap calls={calls} />
          <DurationHistogram calls={calls} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SentimentScoreChart calls={calls} />
          <TagsChart calls={calls} />
        </div>

        <AgentTable calls={calls} />
      </div>
    </div>
  );
}
