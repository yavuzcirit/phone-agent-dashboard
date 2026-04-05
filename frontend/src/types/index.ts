export type CallStatus =
  | "completed"
  | "no_answer"
  | "busy"
  | "voicemail"
  | "failed"
  | "in_progress"
  | "pending"
  | "initiated";

export type Sentiment = "positive" | "neutral" | "negative" | "mixed";
export type Direction = "inbound" | "outbound";
export type Voice = "burcin" | "callie";

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
  voice_used: Voice;
  transcript_preview: string;
  recording_url: string;
  tags: string[];
  cost_credits: number;
}

export interface MockCallSummary {
  by_status: Record<CallStatus, number>;
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
  voice: Voice;
  prompt: string;
  welcome_message: string;
  status: CallStatus;
  raw_response: string | null;
  error_message: string | null;
  cost_credits: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface MakeCallPayload {
  voice: Voice;
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
  luron_response: unknown;
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
