"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import type { MakeCallPayload, MakeCallResponse } from "@/types";

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

const schema = z.object({
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(E164_REGEX, "Must be E.164 format — e.g. +905551234567"),
  voice: z.enum(["callie", "burcin"]),
  welcome_message: z.string().min(1, "Welcome message is required"),
  prompt: z
    .string()
    .min(10, "System prompt must be at least 10 characters"),
  inject_weather: z.boolean(),
  inject_exchange_rates: z.boolean(),
  inject_knowledge_base: z.boolean(),
  kb_query: z.string(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  phone_number: "",
  voice: "callie",
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

export function CallForm({ onCallInitiated, onSuccess, onError }: Props) {
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

  const injectKnowledgeBase = watch("inject_knowledge_base");
  const phoneValue = watch("phone_number");

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+905551234567"
                aria-invalid={!!errors.phone_number}
                className={errors.phone_number ? "border-red-500 focus-ring-accent" : ""}
                {...register("phone_number")}
              />
              <FieldError message={errors.phone_number?.message} />
            </div>
            <div>
              <Label htmlFor="voice">Voice</Label>
              <Select id="voice" {...register("voice")}>
                <option value="callie">Callie</option>
                <option value="burcin">Burcin</option>
              </Select>
              <FieldError message={errors.voice?.message} />
            </div>
          </div>

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
