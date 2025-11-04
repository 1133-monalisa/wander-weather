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
 * fallback can be number | string | null.
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

// --- helper: sleep + retryWithBackoff ---
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * retryWithBackoff - retries the provided function on transient errors (429, 503, etc)
 */
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
        err?.error?.code ?? err?.status ?? err?.statusCode ?? err?.code ?? err?.status_text;

      // Consider these statuses transient. If not one of these, treat as non-transient.
      const transientStatuses = new Set([429, 503, 'UNAVAILABLE', 'RATE_LIMIT_EXCEEDED', 'TOO_MANY_REQUESTS']);
      const isTransient =
        (typeof status === 'number' && (status === 429 || status === 503)) ||
        (typeof status === 'string' && transientStatuses.has(status));

      if (!isTransient || attempt >= attempts) {
        // Rethrow the original error
        throw err;
      }

      // Exponential backoff with jitter
      const expo = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
      const jitter = Math.floor(Math.random() * Math.min(1000, Math.floor(expo / 2)));
      const wait = Math.max(100, expo - jitter);
      console.warn(
        `Model call failed (attempt ${attempt}/${attempts}). status=${String(status)} — retrying in ${wait}ms`,
        err?.message ?? err
      );
      await sleep(wait);
      // loop to retry
    }
  }
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

    // Prepare a compact 7-day summary for the prompt
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

    // Enhanced prompt asking for concise bullet points and extra contextual info
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

    // --- Model call with retry + fallback ---
    const modelPrimary = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
    const modelFallback = process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-2.1';

    let response: any = null;

    try {
      response = await retryWithBackoff(
        async () =>
          await ai.models.generateContent({
            model: modelPrimary,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          }),
        /*attempts=*/ 5,
        /*baseDelayMs=*/ 600,
        /*maxDelayMs=*/ 8000
      );
    } catch (errPrimary: any) {
      console.error('Primary model failed after retries:', errPrimary?.message ?? errPrimary);
      // Try fallback once
      try {
        console.info(`Attempting fallback model: ${modelFallback}`);
        response = await ai.models.generateContent({
          model: modelFallback,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
      } catch (errFallback: any) {
        console.error('Fallback model also failed:', errFallback?.message ?? errFallback);
        return NextResponse.json(
          {
            error: 'Suggestion service temporarily unavailable. Please try again in a few minutes.',
            details:
              process.env.NODE_ENV === 'development'
                ? String(errFallback?.message ?? errFallback)
                : undefined,
          },
          { status: 503 }
        );
      }
    }

    // Defensive extraction of text from possible model response shapes
    let suggestionText = '';
    try {
      suggestionText =
        (response?.text as string) ??
        (response?.outputText as string) ??
        (Array.isArray(response?.outputs) && response.outputs.length
          ? // @ts-ignore
            response.outputs.map((o: any) => o.text || o.content || '').join('\n')
          : '') ??
        '';
      suggestionText = String(suggestionText).trim();
    } catch (e) {
      console.warn('Error extracting suggestion text:', e);
      suggestionText = '';
    }

    if (!suggestionText) {
      console.error('AI returned empty suggestion:', response);
      return NextResponse.json({ error: 'AI returned empty suggestion.' }, { status: 500 });
    }

    return NextResponse.json({ suggestion: suggestionText }, { status: 200 });
  } catch (error: any) {
    console.error('Suggestion API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate suggestion.' },
      { status: 500 }
    );
  }
}
