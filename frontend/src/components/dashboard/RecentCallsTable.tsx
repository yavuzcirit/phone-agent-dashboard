import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDuration, sentimentStyle, statusStyle } from "@/lib/utils";
import type { MockCall } from "@/types";

interface Props {
  calls: MockCall[];
}

export function RecentCallsTable({ calls }: Props) {
  const recent = calls.slice(0, 8);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Calls</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60">
                {["Contact", "Phone", "Direction", "Topic", "Duration", "Sentiment", "Status", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {recent.map((call) => (
                <tr key={call.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-200 whitespace-nowrap">
                    {call.contact_name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">
                    {call.phone_number}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      className={
                        call.direction === "inbound"
                          ? "bg-indigo-500/15 text-indigo-400 ring-indigo-500/25"
                          : "bg-sky-500/15 text-sky-400 ring-sky-500/25"
                      }
                    >
                      {call.direction}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{call.topic}</td>
                  <td className="px-5 py-3.5 text-slate-400 tabular-nums">
                    {formatDuration(call.duration_seconds)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={sentimentStyle(call.sentiment)}>{call.sentiment}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={statusStyle(call.status)}>{call.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                    {formatDate(call.started_at)}
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
