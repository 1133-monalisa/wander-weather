// app/api/suggestion/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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
      weather?: { description?: string }[];
    };
    daily: Array<{
      dt: number;
      temp?: { day?: number | null; max?: number | null; min?: number | null };
      pop?: number | null;
      weather?: { description?: string }[];
    }>;
  };
};

/**
 * Try to coerce input to a number. If not possible, return the provided fallback.
 */
function safeNum(n: any, fallback: number | string | null = null): number | string | null {
  if (typeof n === 'number' && !Number.isNaN(n)) return n;
  if (typeof n === 'string') {
    const parsed = Number(n);
    if (!Number.isNaN(parsed)) return parsed;
    return fallback;
  }
  return fallback;
}

// --- Helper: sleep ---
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Retry with exponential backoff ---
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

      const transientStatuses = new Set([429, 503, 'UNAVAILABLE', 'RATE_LIMIT_EXCEEDED', 'TOO_MANY_REQUESTS']);
      const isTransient =
        (typeof status === 'number' && (status === 429 || status === 503)) ||
        (typeof status === 'string' && transientStatuses.has(status));

      if (!isTransient || attempt >= attempts) {
        throw err;
      }

      const expo = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
      const jitter = Math.floor(Math.random() * Math.min(1000, Math.floor(expo / 2)));
      const wait = Math.max(100, expo - jitter);

      console.warn(
        `Model call failed (attempt ${attempt}/${attempts}), status=${String(status)} — retrying in ${wait}ms`,
        err?.message ?? err
      );
      await sleep(wait);
    }
  }
}

// --- Safe extraction of text from Gemini response (handles multiple shapes) ---
function extractSuggestionText(response: any): string {
  if (!response) return '';

  // Common direct text fields
  if (typeof response.text === 'string') return response.text.trim();
  if (typeof response.outputText === 'string') return response.outputText.trim();

  // Array of candidates (newer Gemini format)
  if (Array.isArray(response.candidates)) {
    const parts = response.candidates
      .flatMap((c: any) => c.content?.parts ?? [])
      .map((p: any) => p.text ?? '')
      .filter(Boolean);
    if (parts.length) return parts.join('\n').trim();
  }

  // Older formats
  if (Array.isArray(response.outputs)) {
    return response.outputs
      .map((o: any) => o?.text ?? o?.content ?? '')
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  return '';
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not set in environment variables.' },
      { status: 500 }
    );
  }

  let payload: WeatherPayload;
  try {
    payload = await request.json();
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!payload?.location?.name || !Array.isArray(payload?.weather?.daily)) {
    return NextResponse.json(
      { error: 'Payload missing required fields (location.name, weather.daily).' },
      { status: 400 }
    );
  }

  try {
    const location = payload.location.name;
    const country = payload.location.country ?? '';
    const currentTemp = safeNum(payload.weather.current?.temp, 'unknown');
    const currentWeather = payload.weather.current?.weather?.[0]?.description ?? 'Unknown';

    // Prepare compact 7-day forecast
    const dailyForecast = payload.weather.daily.slice(0, 7).map((day: any) => {
      const date = new Date(day.dt * 1000).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const min = safeNum(day.temp?.min, '—');
      const max = safeNum(day.temp?.max, '—');
      const rain = typeof day.pop === 'number' ? Math.round((day.pop ?? 0) * 100) : '—';
      const desc = day.weather?.[0]?.description ?? 'Unknown';
      return { date, min, max, rain, desc };
    });

    const prompt = `
You are an expert travel planner and local guide for ${location}, ${country}.
Analyze the 7-day weather data below and produce a concise, easy-to-skim travel suggestion in **short bullet points**.
Keep the whole response brief (aim for ~150-300 words), use simple markdown bullets and bold labels, and avoid long paragraphs.
Do NOT use markdown headings. Keep each bullet line short.

Current conditions: ${currentTemp ?? '—'}°C — ${currentWeather}

7-day forecast:
${dailyForecast
  .map((d) => `- ${d.date}: ${d.min}°C to ${d.max}°C, Rain: ${d.rain}%, ${d.desc}`)
  .join('\n')}

Include these labeled sections (each as short bullets prefixed by a bold label). Use 1–5 bullets per section:
- **Activity Recommendations:** specific indoor/outdoor activities suitable for this week's weather.
- **Best Day(s) to Go:** name the day(s)/date(s) and one short reason (weather or comfort).
- **Crowd & Timing:** when to go to avoid crowds or catch best light (time of day).
- **Local Food:** 2 must-try dishes or drinks and where to try them (street/market/cafe).
- **Top Viewpoints & Sights:** 3 quick must-sees, include one lesser-known spot if possible.
- **Short History / Fun Fact:** one-sentence historical note + one fun fact.
- **Packing Tips:** 3 concise, practical items to bring this week (weather-specific).
- **Vibe Summary:** 1–2 short sentences describing the overall travel mood this week.

Tone: friendly, local, practical. Make lines short and scannable.
    `;

    const modelPrimary = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
    const modelFallback = process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-1.5-pro';

    let response: any = null;

    try {
      response = await retryWithBackoff(async () =>
        ai.models.generateContent({
          model: modelPrimary,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        })
      );
    } catch (errPrimary: any) {
      console.error('Primary model failed after retries:', errPrimary);
      console.info(`Falling back to model: ${modelFallback}`);
      try {
        response = await ai.models.generateContent({
          model: modelFallback,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
      } catch (errFallback: any) {
        console.error('Fallback model failed:', errFallback);
        return NextResponse.json(
          {
            error: 'Suggestion service temporarily unavailable. Please try again later.',
            details: process.env.NODE_ENV === 'development' ? String(errFallback) : undefined,
          },
          { status: 503 }
        );
      }
    }

    const suggestionText = extractSuggestionText(response);

    if (!suggestionText) {
      console.error('AI returned empty or unreadable response:', response);
      return NextResponse.json({ error: 'Failed to generate suggestion.' }, { status: 500 });
    }

    return NextResponse.json({ suggestion: suggestionText }, { status: 200 });
  } catch (error: any) {
    console.error('Suggestion API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}