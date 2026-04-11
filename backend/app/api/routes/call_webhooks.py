"""Twilio webhook handlers for live call conversation flow.

Call lifecycle:
  1. POST /api/calls/{id}/answer   — Twilio dials, user answers → greet + listen
  2. POST /api/calls/{id}/respond  — User speech transcribed → AI responds + listen
  3. POST /api/calls/{id}/status   — Twilio status callback → update DB

These endpoints return TwiML (XML), not JSON.
They must be reachable from Twilio's servers (set SERVER_BASE_URL in .env).
In development, expose them with: ngrok http 8000
"""
import json
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, Form, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.call import CallRecord
from app.services.conversation_engine import get_conversation_engine
from app.services.voice_catalog import get_voice

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/calls", tags=["call-webhooks"])

_TWIML_CONTENT_TYPE = "application/xml"

# Silence threshold — after this many seconds without speech, hang up
_GATHER_TIMEOUT = 8
_MAX_TURNS = 20  # safety cap to avoid infinite loops


def _twiml_respond(text: str, voice: str, language: str, gather_action: str) -> str:
    """Build a TwiML <Gather> that speaks *text* then listens for a reply."""
    safe_text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        "<Response>"
        f'<Gather input="speech" action="{gather_action}" method="POST" '
        f'timeout="{_GATHER_TIMEOUT}" speechTimeout="auto" language="{language}">'
        f'<Say voice="{voice}" language="{language}">{safe_text}</Say>'
        "</Gather>"
        f'<Say voice="{voice}" language="{language}">I didn\'t catch that. Goodbye!</Say>'
        "<Hangup/>"
        "</Response>"
    )


def _twiml_hangup(text: str, voice: str, language: str) -> str:
    """Build a TwiML that says *text* then hangs up."""
    safe_text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        "<Response>"
        f'<Say voice="{voice}" language="{language}">{safe_text}</Say>'
        "<Hangup/>"
        "</Response>"
    )


@router.post("/{record_id}/answer")
async def call_answered(
    record_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Twilio webhook — called the moment the called party answers.

    Returns TwiML that greets the caller and opens a speech Gather.
    """
    result = await db.execute(select(CallRecord).where(CallRecord.id == record_id))
    record = result.scalar_one_or_none()

    if not record:
        logger.error("call_answered: record %s not found", record_id)
        twiml = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            "<Response><Say>An error occurred. Goodbye!</Say><Hangup/></Response>"
        )
        return Response(content=twiml, media_type=_TWIML_CONTENT_TYPE)

    voice_info = get_voice(record.voice)
    twilio_voice = voice_info.twilio_voice if voice_info else "Polly.Joanna"
    language_code = voice_info.language_code if voice_info else "en-US"

    respond_url = str(request.url_for("call_respond", record_id=record_id))
    twiml = _twiml_respond(
        text=record.welcome_message,
        voice=twilio_voice,
        language=language_code,
        gather_action=respond_url,
    )

    record.status = "in_progress"
    record.conversation_history = json.dumps([])
    await db.commit()

    return Response(content=twiml, media_type=_TWIML_CONTENT_TYPE)


@router.post("/{record_id}/respond")
async def call_respond(
    record_id: str,
    request: Request,
    SpeechResult: str = Form(default=""),
    db: AsyncSession = Depends(get_db),
):
    """Twilio webhook — called with the transcribed speech from the caller.

    Runs the conversation engine and returns the next TwiML turn.
    """
    result = await db.execute(select(CallRecord).where(CallRecord.id == record_id))
    record = result.scalar_one_or_none()

    if not record:
        logger.error("call_respond: record %s not found", record_id)
        twiml = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            "<Response><Say>An error occurred. Goodbye!</Say><Hangup/></Response>"
        )
        return Response(content=twiml, media_type=_TWIML_CONTENT_TYPE)

    voice_info = get_voice(record.voice)
    twilio_voice = voice_info.twilio_voice if voice_info else "Polly.Joanna"
    language_code = voice_info.language_code if voice_info else "en-US"

    # Load conversation history
    history: list[dict] = []
    if record.conversation_history:
        try:
            history = json.loads(record.conversation_history)
        except Exception:
            history = []

    # Safety cap on turn count
    if len(history) >= _MAX_TURNS * 2:
        twiml = _twiml_hangup(
            "We've reached the maximum conversation length. Thank you and goodbye!",
            twilio_voice,
            language_code,
        )
        record.status = "completed"
        record.completed_at = datetime.utcnow()
        await db.commit()
        return Response(content=twiml, media_type=_TWIML_CONTENT_TYPE)

    user_text = SpeechResult.strip()
    if not user_text:
        respond_url = str(request.url_for("call_respond", record_id=record_id))
        twiml = _twiml_respond(
            text="I'm sorry, I didn't catch that. Could you please repeat?",
            voice=twilio_voice,
            language=language_code,
            gather_action=respond_url,
        )
        return Response(content=twiml, media_type=_TWIML_CONTENT_TYPE)

    # Generate AI response
    engine = get_conversation_engine()
    if engine:
        try:
            ai_response = await engine.respond(
                system_prompt=record.prompt,
                history=history,
                user_message=user_text,
            )
        except Exception:
            logger.exception("Conversation engine error for record %s", record_id)
            ai_response = "I'm sorry, I encountered an issue. Let me transfer you to a human agent."
    else:
        ai_response = "I'm sorry, the AI service is currently unavailable. Please call back later."

    # Persist updated history
    history.append({"role": "user", "content": user_text})
    history.append({"role": "assistant", "content": ai_response})
    record.conversation_history = json.dumps(history)
    await db.commit()

    respond_url = str(request.url_for("call_respond", record_id=record_id))
    twiml = _twiml_respond(
        text=ai_response,
        voice=twilio_voice,
        language=language_code,
        gather_action=respond_url,
    )
    return Response(content=twiml, media_type=_TWIML_CONTENT_TYPE)


@router.post("/{record_id}/status")
async def call_status(
    record_id: str,
    CallStatus: str = Form(default=""),
    CallDuration: str = Form(default="0"),
    db: AsyncSession = Depends(get_db),
):
    """Twilio status callback — update DB with final call status."""
    result = await db.execute(select(CallRecord).where(CallRecord.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        logger.warning("call_status: record %s not found", record_id)
        return Response(status_code=204)

    status_map = {
        "completed": "completed",
        "busy": "busy",
        "no-answer": "no_answer",
        "failed": "failed",
        "canceled": "failed",
    }
    new_status = status_map.get(CallStatus.lower(), CallStatus.lower())

    if new_status in ("completed", "busy", "no_answer", "failed"):
        record.status = new_status
        record.completed_at = datetime.utcnow()
        try:
            duration_seconds = int(CallDuration)
            record.cost_credits = round(duration_seconds * 0.002, 4)
        except ValueError:
            pass
        await db.commit()
        logger.info("Call %s → status=%s duration=%ss", record_id, new_status, CallDuration)

    return Response(status_code=204)
