"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { formatDate, statusStyle } from "@/lib/utils";
import type { CallRecord } from "@/types";

interface Props {
  records: CallRecord[];
  onDelete: (id: string) => Promise<void>;
}

export function CallHistory({ records, onDelete }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!pendingId) return;
    setDeleting(true);
    await onDelete(pendingId);
    setDeleting(false);
    setPendingId(null);
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-8">
            No calls initiated yet. Configure and trigger your first call above.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pending = records.find((r) => r.id === pendingId);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Call History ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  {["Phone Number", "Voice", "Status", "Initiated", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-300">
                      {record.phone_number}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 capitalize">{record.voice}</td>
                    <td className="px-5 py-3.5">
                      <Badge className={statusStyle(record.status)}>
                        {record.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(record.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingId(record.id)}
                        className="text-slate-600 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={pendingId !== null}
        onClose={() => setPendingId(null)}
        title="Delete call record?"
        description={
          pending
            ? `This will permanently remove the record for ${pending.phone_number}.`
            : undefined
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={handleConfirm}
        loading={deleting}
      />
    </>
  );
}
