"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/knowledge-base/FileDropzone";
import { DocumentList } from "@/components/knowledge-base/DocumentList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import type { KnowledgeDocument } from "@/types";

interface Props {
  initialDocuments: KnowledgeDocument[];
}

export function KnowledgeBaseClient({ initialDocuments }: Props) {
  const [documents, setDocuments] = useState(initialDocuments);

  const handleUploaded = (doc: KnowledgeDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleDelete = async (id: string) => {
    await api.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <FileDropzone onUploaded={handleUploaded} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stored Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <DocumentList documents={documents} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
