import io
import logging
import uuid
from pathlib import Path
from typing import Sequence

import chromadb
from chromadb.utils import embedding_functions

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

CHUNK_SIZE = 512
CHUNK_OVERLAP = 50
COLLECTION_NAME = "knowledge_base"


def _get_chroma_collection() -> chromadb.Collection:
    Path(settings.chroma_persist_dir).mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=settings.chroma_persist_dir)

    if settings.openai_api_key:
        embed_fn = embedding_functions.OpenAIEmbeddingFunction(
            api_key=settings.openai_api_key,
            model_name="text-embedding-3-small",
        )
    else:
        embed_fn = embedding_functions.DefaultEmbeddingFunction()

    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embed_fn,
        metadata={"hnsw:space": "cosine"},
    )


def _extract_pdf_text(content: bytes) -> str:
    import pdfplumber

    text_parts: list[str] = []
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def _extract_docx_text(content: bytes) -> str:
    from docx import Document

    doc = Document(io.BytesIO(content))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def _chunk_text(text: str) -> list[str]:
    words = text.split()
    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + CHUNK_SIZE, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return [c for c in chunks if len(c.strip()) > 20]


def extract_text(filename: str, content: bytes) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return _extract_pdf_text(content)
    if lower.endswith(".docx"):
        return _extract_docx_text(content)
    raise ValueError(f"Unsupported file type: {filename}")


def embed_and_store(document_id: str, filename: str, text: str) -> int:
    chunks = _chunk_text(text)
    if not chunks:
        return 0

    collection = _get_chroma_collection()
    ids = [f"{document_id}_{i}" for i in range(len(chunks))]
    metadatas = [{"document_id": document_id, "filename": filename, "chunk_index": i} for i in range(len(chunks))]

    collection.add(documents=chunks, ids=ids, metadatas=metadatas)
    logger.info("Stored %d chunks for document %s", len(chunks), document_id)
    return len(chunks)


def query_knowledge_base(query: str, top_k: int = 5) -> list[dict]:
    collection = _get_chroma_collection()
    count = collection.count()
    if count == 0:
        return []

    results = collection.query(
        query_texts=[query],
        n_results=min(top_k, count),
        include=["documents", "metadatas", "distances"],
    )

    output: list[dict] = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        output.append(
            {
                "chunk": doc,
                "document_id": meta["document_id"],
                "filename": meta["filename"],
                "score": round(1 - dist, 4),
            }
        )
    return output


def delete_document_chunks(document_id: str) -> None:
    collection = _get_chroma_collection()
    existing = collection.get(where={"document_id": document_id})
    if existing["ids"]:
        collection.delete(ids=existing["ids"])
    logger.info("Deleted chunks for document %s", document_id)
