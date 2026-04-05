"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShortDate, TOOLTIP_PROPS } from "@/lib/utils";
import type { MockCall } from "@/types";

interface Props {
  calls: MockCall[];
}

export function SentimentScoreChart({ calls }: Props) {
  const data = [...calls]
    .filter((c) => c.sentiment_score != null)
    .sort((a, b) => a.started_at.localeCompare(b.started_at))
    .map((c) => ({
      date: formatShortDate(c.started_at),
      score: Math.round((c.sentiment_score as number) * 100) / 100,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Score Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis domain={[-1, 1]} tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <ReferenceLine y={0} stroke="#334155" strokeDasharray="4 4" />
            <Tooltip
              {...TOOLTIP_PROPS}
              itemStyle={{ ...TOOLTIP_PROPS.itemStyle, color: "#34d399" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              name="Sentiment"
              stroke="#34d399"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#34d399", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
