"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOOLTIP_PROPS } from "@/lib/utils";
import type { MockCall } from "@/types";

interface Props {
  calls: MockCall[];
}

const TAG_COLORS = ["#818cf8", "#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#f87171"];

export function TagsChart({ calls }: Props) {
  const counts = calls.reduce<Record<string, number>>((acc, c) => {
    for (const tag of c.tags) {
      acc[tag] = (acc[tag] ?? 0) + 1;
    }
    return acc;
  }, {});

  const data = Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Call Tags</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-8">No tags found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="tag" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_PROPS} />
            <Bar dataKey="count" name="Calls" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={TAG_COLORS[i % TAG_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
