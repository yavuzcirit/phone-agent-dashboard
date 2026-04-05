import type {
  CallRecord,
  IntegrationContext,
  KnowledgeDocument,
  MakeCallPayload,
  MakeCallResponse,
  MockCallsResponse,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  getMockCalls: (count = 100): Promise<MockCallsResponse> =>
    request(`/mock-data?count=${count}`),

  makeCall: (payload: MakeCallPayload): Promise<MakeCallResponse> =>
    request("/calls", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listCalls: (): Promise<CallRecord[]> => request("/calls"),

  deleteCall: (id: string): Promise<void> =>
    request(`/calls/${id}`, { method: "DELETE" }),

  listDocuments: (): Promise<KnowledgeDocument[]> => request("/knowledge-base"),

  uploadDocument: (file: File): Promise<KnowledgeDocument> => {
    const form = new FormData();
    form.append("file", file);
    return request("/knowledge-base/upload", {
      method: "POST",
      headers: {},
      body: form,
    });
  },

  deleteDocument: (id: string): Promise<void> =>
    request(`/knowledge-base/${id}`, { method: "DELETE" }),

  queryKnowledgeBase: (
    query: string,
    top_k = 5
  ): Promise<{ results: unknown[]; context_snippet: string }> =>
    request("/knowledge-base/query", {
      method: "POST",
      body: JSON.stringify({ query, top_k }),
    }),

  getWeather: (city = "Istanbul"): Promise<IntegrationContext> =>
    request(`/integrations/weather?city=${encodeURIComponent(city)}`),

  getExchangeRates: (base = "TRY"): Promise<IntegrationContext> =>
    request(`/integrations/exchange-rates?base=${base}`),
};
