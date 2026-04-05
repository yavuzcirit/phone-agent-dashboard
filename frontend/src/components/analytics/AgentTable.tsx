import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";
import type { MockCall } from "@/types";

interface Props {
  calls: MockCall[];
}

interface AgentStats {
  name: string;
  calls: number;
  avgDuration: number;
  completionRate: number;
  avgSentiment: number;
  totalCredits: number;
}

function buildAgentStats(calls: MockCall[]): AgentStats[] {
  const map = new Map<string, MockCall[]>();
  for (const call of calls) {
    const key = call.agent_name;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(call);
  }

  return Array.from(map.entries())
    .map(([name, agentCalls]) => ({
      name,
      calls: agentCalls.length,
      avgDuration: Math.round(
        agentCalls.reduce((s, c) => s + c.duration_seconds, 0) / agentCalls.length
      ),
      completionRate:
        (agentCalls.filter((c) => c.status === "completed").length / agentCalls.length) * 100,
      avgSentiment: (() => {
        const scored = agentCalls.filter((c) => c.sentiment_score != null);
        if (scored.length === 0) return 0;
        return scored.reduce((s, c) => s + (c.sentiment_score as number), 0) / scored.length;
      })(),
      totalCredits: agentCalls.reduce((s, c) => s + c.cost_credits, 0),
    }))
    .sort((a, b) => b.calls - a.calls);
}

export function AgentTable({ calls }: Props) {
  const stats = buildAgentStats(calls);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Agent Performance</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60">
                {["Agent", "Calls", "Avg Duration", "Completion Rate", "Avg Sentiment", "Credits Used"].map((h) => (
                  <th
                    key={h}
                    className="px-5 pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {stats.map((row) => (
                <tr key={row.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-200">{row.name}</td>
                  <td className="px-5 py-3.5 text-slate-400 tabular-nums">{row.calls}</td>
                  <td className="px-5 py-3.5 text-slate-400">{formatDuration(row.avgDuration)}</td>
                  <td className="px-5 py-3.5 text-slate-400 tabular-nums">
                    {row.completionRate.toFixed(0)}%
                  </td>
                  <td
                    className={`px-5 py-3.5 tabular-nums font-medium ${
                      row.avgSentiment > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {row.avgSentiment > 0 ? "+" : ""}
                    {row.avgSentiment.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 tabular-nums">
                    {row.totalCredits.toFixed(2)} cr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
