"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PhoneCall, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import type {
  LanguageInfo,
  MakeCallPayload,
  MakeCallResponse,
  VoiceInfo,
} from "@/types";

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

const schema = z.object({
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(E164_REGEX, "Must be E.164 format — e.g. +14155552671"),
  language_code: z.string().min(1, "Language is required"),
  voice: z.string().min(1, "Voice is required"),
  welcome_message: z.string().min(1, "Welcome message is required"),
  prompt: z.string().min(10, "System prompt must be at least 10 characters"),
  inject_weather: z.boolean(),
  inject_exchange_rates: z.boolean(),
  inject_knowledge_base: z.boolean(),
  kb_query: z.string(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  phone_number: "",
  language_code: "en-US",
  voice: "aria",
  welcome_message: "Hello! This is Call Bank. How can I assist you today?",
  prompt:
    "You are a professional Call Bank AI agent. Your goal is to assist the customer with their banking needs in a polite, concise, and helpful manner. Always verify the customer's identity before discussing account details.",
  inject_weather: false,
  inject_exchange_rates: false,
  inject_knowledge_base: false,
  kb_query: "",
};

interface Props {
  onCallInitiated: (response: MakeCallResponse, payload: MakeCallPayload) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

const GENDER_ICON: Record<string, string> = { female: "♀", male: "♂", neutral: "◎" };
const STYLE_COLORS: Record<string, string> = {
  professional: "text-blue-400",
  authoritative: "text-purple-400",
  friendly: "text-green-400",
  warm: "text-orange-400",
  energetic: "text-yellow-400",
  calm: "text-cyan-400",
  expressive: "text-pink-400",
};

export function CallForm({ onCallInitiated, onSuccess, onError }: Props) {
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<VoiceInfo[]>([]);
  const [selectedVoiceInfo, setSelectedVoiceInfo] = useState<VoiceInfo | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });

  const selectedLanguage = watch("language_code");
  const selectedVoice = watch("voice");
  const injectKnowledgeBase = watch("inject_knowledge_base");
  const phoneValue = watch("phone_number");

  // Load voice catalog once
  useEffect(() => {
    Promise.all([api.getLanguages(), api.getVoices()])
      .then(([langs, vs]) => {
        setLanguages(langs);
        setVoices(vs);
      })
      .catch(() => {/* silently degrade — form still works without catalog */})
      .finally(() => setLoadingCatalog(false));
  }, []);

  // Filter voices by selected language
  useEffect(() => {
    const filtered = voices.filter((v) => v.language_code === selectedLanguage);
    setFilteredVoices(filtered);
    if (filtered.length > 0 && !filtered.find((v) => v.id === selectedVoice)) {
      setValue("voice", filtered[0].id);
    }
  }, [selectedLanguage, voices, selectedVoice, setValue]);

  // Track selected voice metadata for preview badge
  useEffect(() => {
    const found = voices.find((v) => v.id === selectedVoice) ?? null;
    setSelectedVoiceInfo(found);
  }, [selectedVoice, voices]);

  // Live E.164 hint: auto-prepend + if user types digits only
  useEffect(() => {
    if (phoneValue && !phoneValue.startsWith("+") && /^\d+$/.test(phoneValue)) {
      setValue("phone_number", `+${phoneValue}`, { shouldValidate: true });
    }
  }, [phoneValue, setValue]);

  const onSubmit = async (values: FormValues) => {
    const payload: MakeCallPayload = {
      phone_number: values.phone_number,
      voice: values.voice,
      language_code: values.language_code,
      welcome_message: values.welcome_message,
      prompt: values.prompt,
      inject_knowledge_base: values.inject_knowledge_base,
      inject_weather: values.inject_weather,
      inject_exchange_rates: values.inject_exchange_rates,
      kb_query: values.kb_query,
    };

    try {
      const response = await api.makeCall(payload);
      onCallInitiated(response, payload);
      onSuccess(`Call initiated — record ID: ${response.record_id}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Call failed");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure &amp; Initiate Call</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {/* Phone Number */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+14155552671"
              aria-invalid={!!errors.phone_number}
              className={errors.phone_number ? "border-red-500" : ""}
              {...register("phone_number")}
            />
            <FieldError message={errors.phone_number?.message} />
          </div>

          {/* Language + Voice row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              {loadingCatalog ? (
                <div className="flex items-center gap-2 h-9 text-xs text-slate-500">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                </div>
              ) : (
                <Select id="language" {...register("language_code")}>
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.voice_count})
                    </option>
                  ))}
                </Select>
              )}
              <FieldError message={errors.language_code?.message} />
            </div>

            <div>
              <Label htmlFor="voice">Voice</Label>
              {loadingCatalog ? (
                <div className="flex items-center gap-2 h-9 text-xs text-slate-500">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                </div>
              ) : (
                <Select
                  id="voice"
                  aria-invalid={!!errors.voice}
                  className={errors.voice ? "border-red-500" : ""}
                  {...register("voice")}
                >
                  {filteredVoices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {GENDER_ICON[v.gender] ?? ""} {v.name} · {v.style}
                    </option>
                  ))}
                </Select>
              )}
              <FieldError message={errors.voice?.message} />
            </div>
          </div>

          {/* Voice description badge */}
          {selectedVoiceInfo && (
            <div className="rounded-md border border-slate-700/50 bg-slate-900/40 px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
              <span className={`font-semibold capitalize ${STYLE_COLORS[selectedVoiceInfo.style] ?? "text-slate-300"}`}>
                {selectedVoiceInfo.style}
              </span>
              <span className="text-slate-600">·</span>
              <span>{selectedVoiceInfo.description}</span>
            </div>
          )}

          {/* Welcome Message */}
          <div>
            <Label htmlFor="welcome">Welcome Message</Label>
            <Input
              id="welcome"
              placeholder="Hello! This is Call Bank…"
              aria-invalid={!!errors.welcome_message}
              className={errors.welcome_message ? "border-red-500" : ""}
              {...register("welcome_message")}
            />
            <FieldError message={errors.welcome_message?.message} />
          </div>

          {/* System Prompt */}
          <div>
            <Label htmlFor="prompt">System Prompt</Label>
            <Textarea
              id="prompt"
              rows={5}
              aria-invalid={!!errors.prompt}
              className={errors.prompt ? "border-red-500" : ""}
              {...register("prompt")}
            />
            <FieldError message={errors.prompt?.message} />
          </div>

          {/* Context Enrichment */}
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Context Enrichment
            </p>

            <Toggle
              checked={watch("inject_weather")}
              onChange={(v) => setValue("inject_weather", v)}
              label="Inject Weather Data"
              description="Appends current weather for Istanbul to the prompt"
            />

            <Toggle
              checked={watch("inject_exchange_rates")}
              onChange={(v) => setValue("inject_exchange_rates", v)}
              label="Inject Exchange Rates"
              description="Appends live TRY exchange rates to the prompt"
            />

            <div className="space-y-2">
              <Toggle
                checked={injectKnowledgeBase}
                onChange={(v) => setValue("inject_knowledge_base", v)}
                label="Inject Knowledge Base"
                description="Retrieves relevant document chunks and injects them"
              />
              {injectKnowledgeBase && (
                <div className="ml-12">
                  <Label htmlFor="kb-query">Knowledge Base Query</Label>
                  <Input
                    id="kb-query"
                    placeholder="e.g. loan interest rates policy"
                    {...register("kb_query")}
                  />
                </div>
              )}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            <PhoneCall className="h-4 w-4" />
            Make Call
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
