import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { KnowledgeBaseClient } from "./KnowledgeBaseClient";
import type { KnowledgeDocument } from "@/types";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description:
    "Upload and manage documents that power context-aware AI calls at Call Bank.",
};

async function getDocuments(): Promise<KnowledgeDocument[]> {
  const apiUrl = process.env.API_URL ?? "http://localhost:8000/api";
  try {
    const res = await fetch(`${apiUrl}/knowledge-base`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function KnowledgeBasePage() {
  const documents = await getDocuments();

  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description="Upload PDF and DOCX files — chunks are embedded and retrieved to enrich call prompts"
      />
      <KnowledgeBaseClient initialDocuments={documents} />
    </div>
  );
}
