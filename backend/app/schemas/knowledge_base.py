from datetime import datetime
from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    filename: str
    file_type: str
    chunk_count: int
    status: str
    error_message: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class QueryResult(BaseModel):
    chunk: str
    document_id: str
    filename: str
    score: float


class QueryResponse(BaseModel):
    results: list[QueryResult]
    context_snippet: str
