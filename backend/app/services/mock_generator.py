"""Self-contained mock call data generator.

Generates realistic call records using the local voice catalog —
no external API dependency required.
"""
import random
import uuid
from datetime import datetime, timedelta, timezone

from app.services.voice_catalog import VOICE_CATALOG, VoiceInfo

# ── Sample data pools ─────────────────────────────────────────────────────────

_CONTACT_NAMES = [
    "James Miller", "Sofia Martinez", "Liam Johnson", "Emma Wilson", "Noah Brown",
    "Olivia Davis", "William Garcia", "Ava Rodriguez", "Benjamin Taylor", "Isabella Moore",
    "Lucas Anderson", "Mia Thomas", "Mason Jackson", "Charlotte White", "Ethan Harris",
    "Amelia Martin", "Alexander Thompson", "Harper Lewis", "Daniel Walker", "Evelyn Hall",
    "Michael Allen", "Abigail Young", "Aiden King", "Emily Wright", "Sebastian Scott",
    "Ella Torres", "Jack Nelson", "Elizabeth Hill", "Henry Carter", "Sofia Mitchell",
    "Camille Dupont", "Pierre Moreau", "Elena Fernandez", "Marco Russo", "Ayse Yilmaz",
    "Kenji Tanaka", "Yuki Nakamura", "Priya Sharma", "Ricardo Costa", "Hana Al-Rashid",
]

_TOPICS = [
    "account balance inquiry", "loan application", "credit card dispute",
    "mortgage refinancing", "investment portfolio review", "fraud alert",
    "account opening", "wire transfer", "insurance claim", "technical support",
    "password reset", "overdraft fee waiver", "direct deposit setup",
    "credit score inquiry", "savings account interest rate", "ATM card replacement",
    "beneficiary update", "tax document request", "payment arrangement", "account closure",
]

_OUTCOMES = [
    "resolved", "escalated to human agent", "callback scheduled",
    "transferred to specialist", "information provided", "application submitted",
    "dispute filed", "account updated", "follow-up email sent", None,
]

_TRANSCRIPT_TEMPLATES = [
    "Customer called about {topic}. Agent provided assistance and the issue was {resolution}.",
    "Outbound call regarding {topic}. Customer was {sentiment} with the service.",
    "Customer inquiry about {topic}. Agent guided through the process step by step.",
    "Follow-up call for {topic}. Issue {resolution} after verification.",
    "Proactive outreach about {topic}. Customer acknowledged and confirmed details.",
]

_TAGS_POOL = [
    "VIP", "first-call-resolution", "escalation", "callback-required",
    "complaint", "compliment", "high-value", "retention", "new-customer",
    "fraud-alert", "promotional", "support", "billing", "technical",
]

_STATUSES = ["completed", "no_answer", "busy", "voicemail", "failed", "in_progress"]
_STATUS_WEIGHTS = [0.60, 0.12, 0.08, 0.10, 0.05, 0.05]

_SENTIMENTS = ["positive", "neutral", "negative", "mixed"]
_SENTIMENT_WEIGHTS = [0.40, 0.30, 0.20, 0.10]

_DIRECTIONS = ["outbound", "inbound"]
_DIRECTION_WEIGHTS = [0.70, 0.30]

_AGENT_NAMES = [
    "Aria", "James", "Charlotte", "Oliver", "Sasha", "Camille",
    "Elena", "Hans", "Sofia", "Marco", "Ayse", "Yuki",
]


# ── Generator ─────────────────────────────────────────────────────────────────

def _random_voice() -> VoiceInfo:
    return random.choice(VOICE_CATALOG)


def _random_duration(status: str) -> int:
    if status in ("no_answer", "busy", "failed"):
        return random.randint(5, 30)
    if status == "voicemail":
        return random.randint(20, 90)
    if status == "in_progress":
        return random.randint(60, 300)
    return random.randint(45, 900)


def _format_duration(seconds: int) -> str:
    m, s = divmod(seconds, 60)
    return f"{m}m {s}s"


def _sentiment_score(sentiment: str) -> float | None:
    mapping = {"positive": 0.75, "neutral": 0.50, "negative": 0.25, "mixed": 0.45}
    base = mapping.get(sentiment, 0.50)
    return round(base + random.uniform(-0.15, 0.15), 3)


def _make_transcript(topic: str, sentiment: str, resolution: str | None) -> str:
    template = random.choice(_TRANSCRIPT_TEMPLATES)
    return template.format(
        topic=topic,
        sentiment=sentiment,
        resolution=resolution or "noted",
    )


def _random_phone() -> str:
    country_code = random.choice(["+1", "+44", "+90", "+49", "+33", "+39", "+55", "+81"])
    number = "".join([str(random.randint(0, 9)) for _ in range(9)])
    return f"{country_code}{number}"


def _generate_one(base_time: datetime) -> dict:
    voice = _random_voice()
    status = random.choices(_STATUSES, weights=_STATUS_WEIGHTS)[0]
    sentiment = random.choices(_SENTIMENTS, weights=_SENTIMENT_WEIGHTS)[0]
    direction = random.choices(_DIRECTIONS, weights=_DIRECTION_WEIGHTS)[0]
    topic = random.choice(_TOPICS)
    outcome = random.choice(_OUTCOMES)
    duration = _random_duration(status)
    started_at = base_time - timedelta(seconds=random.randint(0, 86400 * 30))
    ended_at = started_at + timedelta(seconds=duration)
    tags = random.sample(_TAGS_POOL, k=random.randint(0, 3))
    cost = round(random.uniform(0.05, 2.50), 4) if status == "completed" else round(random.uniform(0.01, 0.15), 4)

    return {
        "id": str(uuid.uuid4()),
        "contact_name": random.choice(_CONTACT_NAMES),
        "phone_number": _random_phone(),
        "direction": direction,
        "status": status,
        "started_at": started_at.isoformat(),
        "ended_at": ended_at.isoformat(),
        "duration_seconds": duration,
        "duration_display": _format_duration(duration),
        "sentiment": sentiment,
        "sentiment_score": _sentiment_score(sentiment),
        "topic": topic,
        "outcome": outcome,
        "agent_name": random.choice(_AGENT_NAMES),
        "voice_used": voice.id,
        "voice_language": voice.language_code,
        "transcript_preview": _make_transcript(topic, sentiment, outcome),
        "recording_url": f"https://recordings.example.com/{uuid.uuid4().hex}.mp3",
        "tags": tags,
        "cost_credits": cost,
    }


def _compute_summary(calls: list[dict]) -> dict:
    by_status: dict[str, int] = {}
    by_sentiment: dict[str, int] = {}
    by_direction: dict[str, int] = {}
    total_duration = 0
    total_cost = 0.0
    completed = 0

    for c in calls:
        by_status[c["status"]] = by_status.get(c["status"], 0) + 1
        by_sentiment[c["sentiment"]] = by_sentiment.get(c["sentiment"], 0) + 1
        by_direction[c["direction"]] = by_direction.get(c["direction"], 0) + 1
        total_duration += c["duration_seconds"]
        total_cost += c["cost_credits"]
        if c["status"] == "completed":
            completed += 1

    n = len(calls)
    return {
        "by_status": by_status,
        "by_sentiment": by_sentiment,
        "by_direction": by_direction,
        "avg_duration_seconds": round(total_duration / n, 1) if n else 0,
        "total_duration_seconds": total_duration,
        "total_cost_credits": round(total_cost, 4),
        "completion_rate": round(completed / n, 4) if n else 0,
    }


def generate_mock_calls(count: int = 50) -> dict:
    """Generate *count* realistic mock call records.

    Returns a shape compatible with the existing frontend mock-data consumer.
    """
    now = datetime.now(tz=timezone.utc)
    calls = [_generate_one(now) for _ in range(count)]
    # Sort newest first (mirrors real call history ordering)
    calls.sort(key=lambda c: c["started_at"], reverse=True)
    return {
        "success": True,
        "generated_at": now.isoformat(),
        "total_calls": len(calls),
        "summary": _compute_summary(calls),
        "calls": calls,
    }
