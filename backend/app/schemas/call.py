from datetime import datetime
from typing import Any
from pydantic import BaseModel, field_validator
import re


class MakeCallRequest(BaseModel):
    voice: str
    prompt: str
    welcome_message: str
    phone_number: str
    inject_knowledge_base: bool = False
    inject_weather: bool = False
    inject_exchange_rates: bool = False
    kb_query: str = ""

    @field_validator("voice")
    @classmethod
    def voice_must_be_valid(cls, v: str) -> str:
        if v not in ("burcin", "callie"):
            raise ValueError("voice must be 'burcin' or 'callie'")
        return v

    @field_validator("phone_number")
    @classmethod
    def phone_must_be_e164(cls, v: str) -> str:
        if not re.match(r"^\+[1-9]\d{6,14}$", v):
            raise ValueError("phone_number must be in E.164 format")
        return v


class CallRecordOut(BaseModel):
    id: str
    phone_number: str
    voice: str
    prompt: str
    welcome_message: str
    status: str
    raw_response: str | None
    error_message: str | None
    cost_credits: float | None
    created_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class MakeCallResponse(BaseModel):
    record_id: str
    status: str
    luron_response: Any
