import asyncio
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.document import KnowledgeDocument
from app.schemas.knowledge_base import DocumentOut, QueryRequest, QueryResponse, QueryResult
from app.services.rag import delete_document_chunks, embed_and_store, extract_text

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/knowledge-base", tags=["knowledge-base"])

ALLOWED_TYPES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload_document(file: UploadFile, db: AsyncSession = Depends(get_db)):
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=422, detail="Only .pdf and .docx files are supported")

    content = await file.read()
    doc_id = str(uuid.uuid4())

    doc = KnowledgeDocument(
        id=doc_id,
        filename=filename,
        file_type=ext.lstrip("."),
        chunk_count=0,
        status="processing",
    )
    db.add(doc)
    await db.commit()

    try:
        text = await asyncio.to_thread(extract_text, filename, content)
        chunk_count = await asyncio.to_thread(embed_and_store, doc_id, filename, text)
        doc.chunk_count = chunk_count
        doc.status = "ready"
    except Exception as exc:
        logger.exception("Failed to process document %s", doc_id)
        doc.status = "error"
        doc.error_message = str(exc)[:512]

    await db.commit()
    await db.refresh(doc)
    return doc


@router.get("", response_model=list[DocumentOut])
async def list_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/{doc_id}", status_code=204)
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(KnowledgeDocument).where(KnowledgeDocument.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    await asyncio.to_thread(delete_document_chunks, doc_id)
    await db.delete(doc)
    await db.commit()


@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    from app.services.rag import query_knowledge_base

    raw = await asyncio.to_thread(query_knowledge_base, request.query, request.top_k)
    results = [
        QueryResult(
            chunk=r["chunk"],
            document_id=r["document_id"],
            filename=r["filename"],
            score=r["score"],
        )
        for r in raw
    ]
    context_snippet = "\n\n".join(r.chunk for r in results[:3])
    return QueryResponse(results=results, context_snippet=context_snippet)
