"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockCall } from "@/types";

interface Props {
  calls: MockCall[];
}

const COLORS = [
  "#10b981", "#818cf8", "#38bdf8", "#fbbf24",
  "#f87171", "#a78bfa", "#fb923c", "#34d399",
  "#e879f9", "#67e8f9",
];

export function OutcomeChart({ calls }: Props) {
  const counts = calls.reduce<Record<string, number>>((acc, c) => {
    const key = c.outcome ?? "Unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Outcomes</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart style={{ outline: "none" }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
              style={{ outline: "none" }}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  style={{ outline: "none" }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                fontSize: 12,
              }}
              itemStyle={{ color: "#e2e8f0" }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {data.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-[11px] text-slate-400">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
