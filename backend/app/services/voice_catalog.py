"""Self-hosted voice catalog — rich, multilingual voice definitions.

Each voice maps to:
- A Twilio/Polly voice ID for in-call TTS via TwiML  (twilio_voice)
- An OpenAI TTS voice ID for preview synthesis       (openai_voice)

Languages covered: en-US, en-GB, en-AU, es-ES, es-US, fr-FR, de-DE,
it-IT, pt-BR, tr-TR, ja-JP, zh-CN, ar-SA, hi-IN, nl-NL, ru-RU, ko-KR, pl-PL
"""
from dataclasses import dataclass
from typing import Literal

Gender = Literal["female", "male", "neutral"]
Style = Literal["professional", "friendly", "authoritative", "calm", "energetic", "warm", "expressive"]


@dataclass(frozen=True)
class VoiceInfo:
    id: str
    name: str
    language_code: str   # BCP-47 e.g. "en-US"
    language_name: str   # Human-readable e.g. "English (US)"
    gender: Gender
    style: Style
    description: str
    twilio_voice: str    # Amazon Polly name used in TwiML <Say> e.g. "Polly.Joanna"
    openai_voice: str    # OpenAI TTS voice ID e.g. "nova"


VOICE_CATALOG: list[VoiceInfo] = [
    # ── English (US) ──────────────────────────────────────────────────────────
    VoiceInfo("aria",      "Aria",      "en-US", "English (US)",       "female", "professional",  "Clear, authoritative voice ideal for business calls",              "Polly.Joanna",   "nova"),
    VoiceInfo("james",     "James",     "en-US", "English (US)",       "male",   "authoritative", "Deep, confident voice for formal interactions",                    "Polly.Matthew",  "onyx"),
    VoiceInfo("sasha",     "Sasha",     "en-US", "English (US)",       "female", "friendly",      "Warm, approachable voice for customer service",                    "Polly.Salli",    "coral"),
    VoiceInfo("max",       "Max",       "en-US", "English (US)",       "male",   "energetic",     "Upbeat, engaging voice for outbound campaigns",                    "Polly.Joey",     "alloy"),
    VoiceInfo("kendra",    "Kendra",    "en-US", "English (US)",       "female", "calm",          "Calm, reassuring voice for support interactions",                  "Polly.Kendra",   "shimmer"),

    # ── English (UK) ──────────────────────────────────────────────────────────
    VoiceInfo("charlotte", "Charlotte", "en-GB", "English (UK)",       "female", "professional",  "Refined British accent, professional and articulate",              "Polly.Amy",      "shimmer"),
    VoiceInfo("emma_gb",   "Emma",      "en-GB", "English (UK)",       "female", "warm",          "Friendly British voice, natural and warm",                         "Polly.Emma",     "coral"),
    VoiceInfo("oliver",    "Oliver",    "en-GB", "English (UK)",       "male",   "authoritative", "Classic British voice, trustworthy and clear",                     "Polly.Brian",    "echo"),

    # ── English (AU) ──────────────────────────────────────────────────────────
    VoiceInfo("jessica",   "Jessica",   "en-AU", "English (AU)",       "female", "friendly",      "Australian accent, natural and warm",                              "Polly.Nicole",   "coral"),
    VoiceInfo("russell",   "Russell",   "en-AU", "English (AU)",       "male",   "professional",  "Confident Australian male voice",                                  "Polly.Russell",  "echo"),

    # ── Spanish (Spain) ───────────────────────────────────────────────────────
    VoiceInfo("elena",     "Elena",     "es-ES", "Spanish (Spain)",    "female", "professional",  "Castilian Spanish, clear and professional",                        "Polly.Conchita", "nova"),
    VoiceInfo("pablo",     "Pablo",     "es-ES", "Spanish (Spain)",    "male",   "friendly",      "Warm Spanish voice, natural and engaging",                         "Polly.Enrique",  "echo"),

    # ── Spanish (US / Latin America) ──────────────────────────────────────────
    VoiceInfo("lucia",     "Lucia",     "es-US", "Spanish (US)",       "female", "energetic",     "Lively bilingual voice for US-Hispanic market",                    "Polly.Lupe",     "shimmer"),
    VoiceInfo("miguel",    "Miguel",    "es-US", "Spanish (US)",       "male",   "professional",  "Clear Latin-American male voice",                                  "Polly.Miguel",   "onyx"),

    # ── French ────────────────────────────────────────────────────────────────
    VoiceInfo("camille",   "Camille",   "fr-FR", "French (France)",    "female", "warm",          "Elegant French voice, sophisticated and warm",                     "Polly.Lea",      "nova"),
    VoiceInfo("pierre",    "Pierre",    "fr-FR", "French (France)",    "male",   "professional",  "Authoritative French voice, classic and clear",                    "Polly.Mathieu",  "onyx"),

    # ── German ────────────────────────────────────────────────────────────────
    VoiceInfo("hanna",     "Hanna",     "de-DE", "German",             "female", "professional",  "Crisp German voice, precise and professional",                     "Polly.Vicki",    "shimmer"),
    VoiceInfo("hans",      "Hans",      "de-DE", "German",             "male",   "authoritative", "Reliable German voice, formal and trustworthy",                    "Polly.Hans",     "echo"),

    # ── Italian ───────────────────────────────────────────────────────────────
    VoiceInfo("sofia",     "Sofia",     "it-IT", "Italian",            "female", "warm",          "Expressive Italian voice, natural and engaging",                   "Polly.Bianca",   "coral"),
    VoiceInfo("marco",     "Marco",     "it-IT", "Italian",            "male",   "friendly",      "Natural Italian voice for conversational calls",                   "Polly.Giorgio",  "alloy"),

    # ── Portuguese (Brazil) ───────────────────────────────────────────────────
    VoiceInfo("valentina", "Valentina", "pt-BR", "Portuguese (BR)",    "female", "friendly",      "Warm Brazilian Portuguese, clear and expressive",                  "Polly.Camila",   "nova"),
    VoiceInfo("ricardo",   "Ricardo",   "pt-BR", "Portuguese (BR)",    "male",   "professional",  "Confident Brazilian voice for professional calls",                 "Polly.Ricardo",  "echo"),

    # ── Turkish ───────────────────────────────────────────────────────────────
    VoiceInfo("ayse",      "Ayse",      "tr-TR", "Turkish",            "female", "professional",  "Natural Turkish voice for local market calls",                     "Polly.Filiz",    "nova"),

    # ── Japanese ──────────────────────────────────────────────────────────────
    VoiceInfo("yuki",      "Yuki",      "ja-JP", "Japanese",           "female", "professional",  "Clear Japanese voice, polite and professional",                    "Polly.Mizuki",   "shimmer"),
    VoiceInfo("kenji",     "Kenji",     "ja-JP", "Japanese",           "male",   "authoritative", "Authoritative Japanese voice for business contexts",               "Polly.Takumi",   "onyx"),

    # ── Chinese (Mandarin) ────────────────────────────────────────────────────
    VoiceInfo("xiaomei",   "Xiao Mei",  "zh-CN", "Chinese (Mandarin)", "female", "professional",  "Clear Mandarin voice for Chinese-speaking customers",              "Polly.Zhiyu",    "nova"),

    # ── Arabic ────────────────────────────────────────────────────────────────
    VoiceInfo("hana",      "Hana",      "ar-SA", "Arabic",             "female", "professional",  "Standard Arabic voice for Middle East markets",                    "Polly.Zeina",    "shimmer"),

    # ── Hindi ─────────────────────────────────────────────────────────────────
    VoiceInfo("priya",     "Priya",     "hi-IN", "Hindi",              "female", "friendly",      "Natural Hindi voice for India market calls",                       "Polly.Aditi",    "nova"),

    # ── Dutch ─────────────────────────────────────────────────────────────────
    VoiceInfo("lotte",     "Lotte",     "nl-NL", "Dutch",              "female", "professional",  "Clear Dutch voice for Netherlands market",                         "Polly.Lotte",    "shimmer"),
    VoiceInfo("ruben",     "Ruben",     "nl-NL", "Dutch",              "male",   "professional",  "Clear Dutch male voice for Netherlands market",                    "Polly.Ruben",    "echo"),

    # ── Russian ───────────────────────────────────────────────────────────────
    VoiceInfo("tatyana",   "Tatyana",   "ru-RU", "Russian",            "female", "professional",  "Clear Russian voice, natural intonation",                          "Polly.Tatyana",  "nova"),
    VoiceInfo("maxim",     "Maxim",     "ru-RU", "Russian",            "male",   "authoritative", "Confident Russian male voice",                                     "Polly.Maxim",    "onyx"),

    # ── Korean ────────────────────────────────────────────────────────────────
    VoiceInfo("seoyeon",   "Seoyeon",   "ko-KR", "Korean",             "female", "friendly",      "Natural Korean voice for Korean-speaking customers",               "Polly.Seoyeon",  "shimmer"),

    # ── Polish ────────────────────────────────────────────────────────────────
    VoiceInfo("maja",      "Maja",      "pl-PL", "Polish",             "female", "professional",  "Clear Polish female voice, warm and professional",                 "Polly.Maja",     "nova"),
    VoiceInfo("jacek",     "Jacek",     "pl-PL", "Polish",             "male",   "authoritative", "Authoritative Polish male voice",                                  "Polly.Jacek",    "onyx"),
]

# ── Lookup helpers ────────────────────────────────────────────────────────────

_VOICE_MAP: dict[str, VoiceInfo] = {v.id: v for v in VOICE_CATALOG}
_VALID_IDS: frozenset[str] = frozenset(_VOICE_MAP)


def get_voice(voice_id: str) -> VoiceInfo | None:
    return _VOICE_MAP.get(voice_id)


def is_valid_voice(voice_id: str) -> bool:
    return voice_id in _VALID_IDS


def get_voices_by_language(language_code: str) -> list[VoiceInfo]:
    return [v for v in VOICE_CATALOG if v.language_code == language_code]


def list_languages() -> list[dict]:
    """Return unique languages with voice counts, ordered by catalog appearance."""
    seen: dict[str, dict] = {}
    for v in VOICE_CATALOG:
        if v.language_code not in seen:
            seen[v.language_code] = {
                "code": v.language_code,
                "name": v.language_name,
                "voice_count": 0,
            }
        seen[v.language_code]["voice_count"] += 1
    return list(seen.values())
