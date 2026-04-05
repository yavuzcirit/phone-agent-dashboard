"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS, TOOLTIP_PROPS } from "@/lib/utils";
import type { MockCallSummary } from "@/types";

interface Props {
  summary: MockCallSummary;
}

export function StatusBreakdownChart({ summary }: Props) {
  const data = Object.entries(summary.by_status)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.replace("_", " "), key: name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_PROPS} />
            <Bar dataKey="value" name="Calls" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={CHART_COLORS[entry.key as keyof typeof CHART_COLORS] ?? "#64748b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
