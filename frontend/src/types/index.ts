export type CallStatus =
  | "completed"
  | "no_answer"
  | "busy"
  | "voicemail"
  | "failed"
  | "in_progress"
  | "pending"
  | "initiated"
  | "simulated";

export type Sentiment = "positive" | "neutral" | "negative" | "mixed";
export type Direction = "inbound" | "outbound";

// Voice is now a free-form string ID from the voice catalog (e.g. "aria", "camille")
export type VoiceId = string;

export interface VoiceInfo {
  id: string;
  name: string;
  language_code: string;   // BCP-47 e.g. "en-US"
  language_name: string;
  gender: "female" | "male" | "neutral";
  style: "professional" | "friendly" | "authoritative" | "calm" | "energetic" | "warm" | "expressive";
  description: string;
  twilio_voice: string;
  openai_voice: string;
}

export interface LanguageInfo {
  code: string;        // BCP-47 e.g. "en-US"
  name: string;        // e.g. "English (US)"
  voice_count: number;
}

export interface MockCall {
  id: string;
  contact_name: string;
  phone_number: string;
  direction: Direction;
  status: CallStatus;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  duration_display: string;
  sentiment: Sentiment;
  sentiment_score: number | null;
  topic: string;
  outcome: string | null;
  agent_name: string;
  voice_used: VoiceId;
  voice_language?: string;
  transcript_preview: string;
  recording_url: string;
  tags: string[];
  cost_credits: number;
}

export interface MockCallSummary {
  by_status: Record<string, number>;
  by_sentiment: Record<Sentiment, number>;
  by_direction: Record<Direction, number>;
  avg_duration_seconds: number;
  total_duration_seconds: number;
  total_cost_credits: number;
  completion_rate: number;
}

export interface MockCallsResponse {
  success: boolean;
  generated_at: string;
  total_calls: number;
  summary: MockCallSummary;
  calls: MockCall[];
}

export interface CallRecord {
  id: string;
  phone_number: string;
  voice: VoiceId;
  language_code: string;
  prompt: string;
  welcome_message: string;
  status: CallStatus;
  twilio_call_sid: string | null;
  raw_response: string | null;
  error_message: string | null;
  cost_credits: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface MakeCallPayload {
  voice: VoiceId;
  language_code: string;
  prompt: string;
  welcome_message: string;
  phone_number: string;
  inject_knowledge_base: boolean;
  inject_weather: boolean;
  inject_exchange_rates: boolean;
  kb_query: string;
}

export interface MakeCallResponse {
  record_id: string;
  status: string;
  call_response: unknown;
}

export interface KnowledgeDocument {
  id: string;
  filename: string;
  file_type: string;
  chunk_count: number;
  status: "processing" | "ready" | "error";
  error_message: string | null;
  created_at: string;
}

export interface IntegrationContext {
  city?: string;
  context: string;
}
