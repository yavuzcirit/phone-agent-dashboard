"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOOLTIP_PROPS } from "@/lib/utils";
import type { MockCall } from "@/types";

interface Props {
  calls: MockCall[];
}

const BUCKET_COLORS = ["#38bdf8", "#60a5fa", "#818cf8", "#a78bfa", "#c084fc", "#e879f9"];

function buildBuckets(calls: MockCall[]) {
  const buckets: Record<string, number> = {
    "0–2m": 0, "2–4m": 0, "4–6m": 0, "6–8m": 0, "8–10m": 0, "10m+": 0,
  };
  for (const call of calls) {
    const min = call.duration_seconds / 60;
    if (min < 2) buckets["0–2m"]++;
    else if (min < 4) buckets["2–4m"]++;
    else if (min < 6) buckets["4–6m"]++;
    else if (min < 8) buckets["6–8m"]++;
    else if (min < 10) buckets["8–10m"]++;
    else buckets["10m+"]++;
  }
  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
}

export function DurationHistogram({ calls }: Props) {
  const data = buildBuckets(calls);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Duration Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="range" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_PROPS} />
            <Bar dataKey="count" name="Calls" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={BUCKET_COLORS[i % BUCKET_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
