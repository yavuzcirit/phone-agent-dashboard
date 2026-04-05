import { FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { KnowledgeDocument } from "@/types";

interface Props {
  documents: KnowledgeDocument[];
  onDelete: (id: string) => void;
}

export function DocumentList({ documents, onDelete }: Props) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-8 w-8 text-slate-700 mb-3" />
        <p className="text-sm text-slate-500">No documents uploaded yet.</p>
        <p className="text-xs text-slate-600 mt-1">
          Drag and drop PDF or DOCX files above to build your knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-700/40">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center gap-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
            <FileText className="h-4 w-4 text-slate-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{doc.filename}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {doc.chunk_count} chunks · {doc.file_type.toUpperCase()} ·{" "}
              {formatDate(doc.created_at)}
            </p>
            {doc.error_message && (
              <p
                className="text-xs text-red-400 mt-0.5 truncate"
                title={doc.error_message}
              >
                {doc.error_message}
              </p>
            )}
          </div>

          <Badge
            className={
              doc.status === "ready"
                ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25"
                : doc.status === "error"
                  ? "bg-red-500/15 text-red-400 ring-red-500/25"
                  : "bg-slate-500/15 text-slate-400 ring-slate-500/25"
            }
          >
            {doc.status}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(doc.id)}
            className="shrink-0 text-slate-600 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
