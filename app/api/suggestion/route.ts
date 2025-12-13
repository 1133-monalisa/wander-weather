// app/api/suggestion/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

type WeatherPayload = {
  location: {
    name: string;
    country?: string;
    state?: string;
    lat?: number;
    lon?: number;
  };
  weather: {
    current?: {
      temp?: number | null;
      weather?: { description?: string; code?: number | null }[];
    };
    daily: Array<{
      dt: number;
      temp?: { day?: number | null; max?: number | null; min?: number | null };
      pop?: number | null; // 0..1
      weather?: { description?: string; code?: number | null }[];
    }>;
  };
};

function safeNum(
  n: any,
  fallback: number | string | null = null
): number | string | null {
  if (typeof n === "number" && !Number.isNaN(n)) return n;
  if (typeof n === "string") {
    const parsed = Number(n);
    if (!Number.isNaN(parsed)) return parsed;
    return fallback;
  }
  return fallback;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts = 5,
  baseDelayMs = 500,
  maxDelayMs = 8000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;

      const status =
        err?.error?.code ??
        err?.status ??
        err?.statusCode ??
        err?.code ??
        err?.status_text;

      const transientStatuses = new Set([
        429,
        503,
        "UNAVAILABLE",
        "RATE_LIMIT_EXCEEDED",
        "TOO_MANY_REQUESTS",
      ]);

      const isTransient =
        (typeof status === "number" && (status === 429 || status === 503)) ||
        (typeof status === "string" && transientStatuses.has(status));

      if (!isTransient || attempt >= attempts) throw err;

      const expo = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
      const jitter = Math.floor(
        Math.random() * Math.min(1000, Math.floor(expo / 2))
      );
      const wait = Math.max(100, expo - jitter);

      console.warn(
        `Model call failed (attempt ${attempt}/${attempts}), status=${String(
          status
        )} — retrying in ${wait}ms`,
        err?.message ?? err
      );

      await sleep(wait);
    }
  }
}

// Handles multiple response shapes
function extractSuggestionText(response: any): string {
  if (!response) return "";
  if (typeof response.text === "string") return response.text.trim();
  if (typeof response.outputText === "string")
    return response.outputText.trim();

  if (Array.isArray(response.candidates)) {
    const parts = response.candidates
      .flatMap((c: any) => c.content?.parts ?? [])
      .map((p: any) => p.text ?? "")
      .filter(Boolean);
    if (parts.length) return parts.join("\n").trim();
  }

  if (Array.isArray(response.outputs)) {
    return response.outputs
      .map((o: any) => o?.text ?? o?.content ?? "")
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  return "";
}

function normalizeMarkdown(s: string) {
  if (!s) return "";
  let out = s.trim().replace(/\r\n/g, "\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.replace(/[ \t]+\n/g, "\n");
  return out;
}

function hasRequiredLabels(md: string) {
  const required = [
    "**Activity Recommendations:**",
    "**Best Day(s) to Go:**",
    "**Crowd & Timing:**",
    "**Local Food:**",
    "**Top Viewpoints & Sights:**",
    "**Short History / Fun Fact:**",
    "**Packing Tips:**",
    "**Vibe Summary:**",
  ];
  return required.every((r) => md.includes(r));
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set in environment variables." },
      { status: 500 }
    );
  }

  let payload: WeatherPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  if (!payload?.location?.name || !Array.isArray(payload?.weather?.daily)) {
    return NextResponse.json(
      {
        error:
          "Payload missing required fields (location.name, weather.daily).",
      },
      { status: 400 }
    );
  }

  try {
    const location = payload.location.name;
    const country = payload.location.country ?? "";
    const currentTemp = safeNum(payload.weather.current?.temp, "unknown");
    const currentWeather =
      payload.weather.current?.weather?.[0]?.description ?? "Unknown";

    const dailyForecast = payload.weather.daily.slice(0, 7).map((day: any) => {
      const date = new Date(day.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const min = safeNum(day.temp?.min, "—");
      const max = safeNum(day.temp?.max, "—");
      const rain =
        typeof day.pop === "number" ? Math.round((day.pop ?? 0) * 100) : "—";
      const desc = day.weather?.[0]?.description ?? "Unknown";

      return { date, min, max, rain, desc };
    });

    const prompt = `
You are an expert local guide + travel planner for ${location}${
      country ? `, ${country}` : ""
    }.
Use the weather forecast to create a practical plan in Markdown.

CRITICAL FORMAT RULES (MUST FOLLOW):
- Do NOT use Markdown headings (#, ##, ###).
- Do NOT write any intro paragraph.
- Only output the sections listed below, in the exact order.
- Every section must start with a label line EXACTLY like this (on its own line):
  **Activity Recommendations:**
- Under each label: 2–6 bullets. EACH bullet must start with "- ".
- Keep bullets short, concrete, and local (neighborhoods, markets, landmarks).
- If rain chance is moderate/high on any day, include at least 1 indoor backup idea.
- Avoid long sentences. No numbered lists.

Current conditions: ${currentTemp ?? "—"}°C — ${currentWeather}

7-day forecast:
${dailyForecast
  .map(
    (d) => `- ${d.date}: ${d.min}°C to ${d.max}°C, Rain: ${d.rain}%, ${d.desc}`
  )
  .join("\n")}

Write these sections in this exact order:

**Activity Recommendations:**
**Best Day(s) to Go:**
**Crowd & Timing:**
**Local Food:**
**Top Viewpoints & Sights:**
**Short History / Fun Fact:**
**Packing Tips:**
**Vibe Summary:**
`.trim();

    const model = "gemini-2.5-flash";

    let response: any = null;

    // keep retry/backoff for transient failures
    response = await retryWithBackoff(async () =>
      ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 900,
        },
      } as any)
    );

    let suggestionText = normalizeMarkdown(extractSuggestionText(response));

    // Soft repair if the model ever drifts from format
    if (suggestionText && !hasRequiredLabels(suggestionText)) {
      const repairPrompt = `
Fix the formatting of the text below to match the rules exactly:
- No headings
- Only these labels, in this order:
**Activity Recommendations:**
**Best Day(s) to Go:**
**Crowd & Timing:**
**Local Food:**
**Top Viewpoints & Sights:**
**Short History / Fun Fact:**
**Packing Tips:**
**Vibe Summary:**
- Under each: 2–6 bullets starting with "- "
Do not add extra sections.

TEXT:
${suggestionText}
`.trim();

      const repair = await retryWithBackoff(async () =>
        ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: repairPrompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 900 },
        } as any)
      );

      const repaired = normalizeMarkdown(extractSuggestionText(repair));
      if (repaired) suggestionText = repaired;
    }

    if (!suggestionText) {
      console.error("AI returned empty/unreadable response:", response);
      return NextResponse.json(
        { error: "Failed to generate suggestion." },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestion: suggestionText }, { status: 200 });
  } catch (error: any) {
    console.error("Suggestion API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
