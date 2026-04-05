"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { groupByHour, TOOLTIP_PROPS } from "@/lib/utils";
import type { MockCall } from "@/types";

interface Props {
  calls: MockCall[];
}

export function HourlyHeatmap({ calls }: Props) {
  const data = groupByHour(calls).map((d) => ({
    ...d,
    label: `${String(d.hour).padStart(2, "0")}:00`,
  }));

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Call Volume by Hour of Day</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_PROPS} />
            <Bar dataKey="count" name="Calls" radius={[3, 3, 0, 0]}>
              {data.map((entry) => {
                const intensity = entry.count / max;
                const r = Math.round(99 + intensity * 30);
                const g = Math.round(102 + intensity * 38);
                const b = Math.round(241 - intensity * 20);
                return (
                  <Cell
                    key={entry.hour}
                    fill={`rgba(${r},${g},${b},${0.25 + intensity * 0.75})`}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
