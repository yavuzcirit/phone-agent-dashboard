"use client";

import { useState } from "react";
import { CallForm } from "@/components/console/CallForm";
import { CallHistory } from "@/components/console/CallHistory";
import { Toaster } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import { api } from "@/lib/api-client";
import type { CallRecord, MakeCallPayload, MakeCallResponse } from "@/types";

interface Props {
  initialRecords: CallRecord[];
}

export function ConsoleClient({ initialRecords }: Props) {
  const [records, setRecords] = useState(initialRecords);
  const { toasts, notify, dismiss } = useToast();

  const handleCallInitiated = (response: MakeCallResponse, payload: MakeCallPayload) => {
    const newRecord: CallRecord = {
      id: response.record_id,
      phone_number: payload.phone_number,
      voice: payload.voice,
      prompt: payload.prompt,
      welcome_message: payload.welcome_message,
      status: "initiated",
      raw_response: null,
      error_message: null,
      cost_credits: null,
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleDelete = async (id: string) => {
    await api.deleteCall(id);
    const record = records.find((r) => r.id === id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    notify(
      `Record for ${record?.phone_number ?? id} deleted successfully`,
      "success"
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CallForm
          onCallInitiated={handleCallInitiated}
          onSuccess={(msg) => notify(msg, "success")}
          onError={(msg) => notify(msg, "error")}
        />
        <CallHistory records={records} onDelete={handleDelete} />
      </div>

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
