import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConsoleClient } from "./ConsoleClient";
import type { CallRecord } from "@/types";

export const metadata: Metadata = {
  title: "Call Console",
  description: "Configure and trigger outbound AI calls via the self-hosted voice engine.",
};

async function getCallHistory(): Promise<CallRecord[]> {
  const apiUrl = process.env.API_URL ?? "http://localhost:8000/api";
  try {
    const res = await fetch(`${apiUrl}/calls`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ConsolePage() {
  const records = await getCallHistory();

  return (
    <div>
      <PageHeader
        title="Call Console"
        description="Configure and trigger outbound calls with context-enriched prompts"
      />
      <ConsoleClient initialRecords={records} />
    </div>
  );
}
