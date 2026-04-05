"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOOLTIP_PROPS } from "@/lib/utils";
import type { MockCall } from "@/types";

interface Props {
  calls: MockCall[];
}

const BAR_COLORS = [
  "#818cf8", "#38bdf8", "#34d399", "#fbbf24",
  "#f87171", "#a78bfa", "#fb923c", "#67e8f9", "#e879f9", "#4ade80",
];

export function TopicsBarChart({ calls }: Props) {
  const counts = calls.reduce<Record<string, number>>((acc, c) => {
    acc[c.topic] = (acc[c.topic] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Calls by Topic</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="topic" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} width={140} />
            <Tooltip {...TOOLTIP_PROPS} />
            <Bar dataKey="count" name="Calls" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
