"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { KnowledgeDocument } from "@/types";

interface Props {
  onUploaded: (doc: KnowledgeDocument) => void;
}

type UploadStatus = "pending" | "uploading" | "done" | "error";

interface QueuedFile {
  file: File;
  id: string;
  status: UploadStatus;
  error?: string;
}

export function FileDropzone({ onUploaded }: Props) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const onUploadedRef = useRef(onUploaded);
  onUploadedRef.current = onUploaded;

  const updateItem = useCallback((id: string, patch: Partial<QueuedFile>) => {
    setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const uploadFile = useCallback(
    async (item: QueuedFile) => {
      updateItem(item.id, { status: "uploading" });
      try {
        const doc = await api.uploadDocument(item.file);
        updateItem(item.id, { status: "done" });
        onUploadedRef.current(doc);
      } catch (err) {
        updateItem(item.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    },
    [updateItem]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      const newItems: QueuedFile[] = accepted.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: "pending" as UploadStatus,
      }));
      setQueue((prev) => [...prev, ...newItems]);
      newItems.forEach(uploadFile);
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: true,
  });

  const clearDone = () => setQueue((prev) => prev.filter((f) => f.status !== "done"));

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer",
          isDragActive
            ? "border-indigo-500 bg-indigo-500/5"
            : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/30"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
          <Upload className="h-5 w-5 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-300">
            {isDragActive ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Supports PDF and DOCX — max 20 MB each</p>
        </div>
        <Button type="button" variant="secondary" size="sm">
          Browse Files
        </Button>
      </div>

      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Upload queue</p>
            <Button variant="ghost" size="sm" onClick={clearDone}>
              Clear done
            </Button>
          </div>
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-3"
            >
              <FileText className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="flex-1 text-sm text-slate-300 truncate">{item.file.name}</span>
              <span
                className={cn(
                  "text-xs font-medium",
                  item.status === "done" && "text-emerald-400",
                  item.status === "uploading" && "text-indigo-400",
                  item.status === "error" && "text-red-400",
                  item.status === "pending" && "text-slate-500"
                )}
              >
                {item.status === "uploading" ? "Processing…" : item.status}
                {item.status === "error" && item.error ? ` — ${item.error}` : null}
              </span>
              <button
                type="button"
                onClick={() => setQueue((prev) => prev.filter((f) => f.id !== item.id))}
                className="text-slate-600 hover:text-slate-400 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
