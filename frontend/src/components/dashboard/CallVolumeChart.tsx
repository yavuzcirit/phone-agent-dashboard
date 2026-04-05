"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { groupCallsByDay, TOOLTIP_PROPS } from "@/lib/utils";
import type { MockCall } from "@/types";

interface Props {
  calls: MockCall[];
}

export function CallVolumeChart({ calls }: Props) {
  const data = groupCallsByDay(calls).map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Call Volume Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_PROPS} itemStyle={{ ...TOOLTIP_PROPS.itemStyle, color: "#818cf8" }} />
            <Area type="monotone" dataKey="count" name="Calls" stroke="#818cf8" strokeWidth={2.5} fill="url(#callGrad)" dot={false} activeDot={{ r: 4, fill: "#818cf8", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
