import json
import logging
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_db
from app.models.call import CallRecord
from app.schemas.call import CallRecordOut, MakeCallRequest, MakeCallResponse
from app.services import exchange_rate as exchange_rate_svc
from app.services import weather as weather_svc
from app.services.rag import query_knowledge_base
from app.services.telephony_service import get_telephony_provider
from app.services.voice_catalog import get_voice

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/calls", tags=["calls"])


async def _build_prompt(request: MakeCallRequest) -> str:
    prompt = request.prompt
    enrichments: list[str] = []

    if request.inject_knowledge_base and request.kb_query:
        chunks = query_knowledge_base(request.kb_query, top_k=3)
        if chunks:
            kb_ctx = "\n".join(f"- {c['chunk']}" for c in chunks)
            enrichments.append(f"Relevant knowledge base context:\n{kb_ctx}")

    if request.inject_weather:
        try:
            weather_ctx = await weather_svc.fetch_weather_context()
            if weather_ctx:
                enrichments.append(weather_ctx)
        except Exception:
            logger.warning("Weather enrichment failed, skipping")

    if request.inject_exchange_rates:
        try:
            rates_ctx = await exchange_rate_svc.fetch_exchange_rate_context()
            if rates_ctx:
                enrichments.append(rates_ctx)
        except Exception:
            logger.warning("Exchange rate enrichment failed, skipping")

    if enrichments:
        prompt = prompt + "\n\n" + "\n\n".join(enrichments)

    return prompt


@router.post("", response_model=MakeCallResponse)
async def make_call(request: MakeCallRequest, db: AsyncSession = Depends(get_db)):
    enriched_prompt = await _build_prompt(request)
    record_id = str(uuid.uuid4())
    settings = get_settings()

    # Resolve voice metadata
    voice_info = get_voice(request.voice)
    language_code = voice_info.language_code if voice_info else request.language_code

    record = CallRecord(
        id=record_id,
        phone_number=request.phone_number,
        voice=request.voice,
        language_code=language_code,
        prompt=enriched_prompt,
        welcome_message=request.welcome_message,
        status="pending",
        created_at=datetime.utcnow(),
    )
    db.add(record)
    await db.commit()

    # Build Twilio webhook URLs
    base = settings.server_base_url.rstrip("/")
    answer_url = f"{base}/api/calls/{record_id}/answer"
    status_url = f"{base}/api/calls/{record_id}/status"

    telephony = get_telephony_provider()
    try:
        call_resp = await telephony.initiate_call(
            phone_number=request.phone_number,
            answer_webhook_url=answer_url,
            status_callback_url=status_url,
        )
        record.status = "initiated"
        record.twilio_call_sid = call_resp.get("call_sid")
        record.raw_response = json.dumps(call_resp)
        record.completed_at = datetime.utcnow() if call_resp.get("status") == "simulated" else None
        await db.commit()
        return MakeCallResponse(
            record_id=record_id,
            status=call_resp.get("status", "initiated"),
            call_response=call_resp,
        )
    except Exception as exc:
        logger.exception("Call initiation failed for record %s", record_id)
        record.status = "failed"
        record.error_message = str(exc)[:512]
        await db.commit()
        raise HTTPException(status_code=502, detail=str(exc))


@router.get("", response_model=list[CallRecordOut])
async def list_calls(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CallRecord).order_by(CallRecord.created_at.desc()).limit(100)
    )
    return result.scalars().all()


@router.delete("/{record_id}", status_code=204)
async def delete_call(record_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CallRecord).where(CallRecord.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    await db.delete(record)
    await db.commit()
