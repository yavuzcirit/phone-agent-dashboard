"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS } from "@/lib/utils";
import type { MockCallSummary } from "@/types";

interface Props {
  summary: MockCallSummary;
}

export function SentimentChart({ summary }: Props) {
  const data = Object.entries(summary.by_sentiment)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart style={{ outline: "none" }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              style={{ outline: "none" }}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS] ?? "#64748b"}
                  style={{ outline: "none" }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              itemStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{
                  background:
                    CHART_COLORS[entry.name as keyof typeof CHART_COLORS] ?? "#64748b",
                }}
              />
              <span className="text-[11px] text-slate-400 capitalize">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
