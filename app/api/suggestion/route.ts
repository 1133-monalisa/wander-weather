import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type WeatherPayload = {
  location: {
    name: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  weather: {
    current?: { temp?: number | null; weather?: { description?: string }[] };
    daily: Array<{
      dt: number;
      temp?: { min?: number | null; max?: number | null };
      pop?: number | null;
      weather?: { description?: string }[];
    }>;
  };
};

function safeNum(n: any, fallback: number | string | null = null) {
  if (typeof n === "number" && !Number.isNaN(n)) return n;
  return fallback;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (
      retries > 0 &&
      (error?.status === 429 || error?.code === 429 || error?.status === 503)
    ) {
      console.warn(`Gemini 429/503 hit. Retrying in ${delay}ms...`);
      await sleep(delay);
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const payload: WeatherPayload = await request.json();
    const { location, weather } = payload;

    const city = location.name;
    const lat = location.lat ?? 0;
    const lon = location.lon ?? 0;
    const currentDesc = weather.current?.weather?.[0]?.description ?? "Clear";
    const currentTemp = safeNum(weather.current?.temp, "—");

    const forecastSummary = weather.daily
      .slice(0, 5)
      .map((d) => {
        const date = new Date(d.dt * 1000).toLocaleDateString("en-US", {
          weekday: "short",
        });
        return `${date}: ${safeNum(d.temp?.max)}°C, Rain: ${Math.round(
          (d.pop ?? 0) * 100
        )}%, ${d.weather?.[0]?.description}`;
      })
      .join("\n");

    const prompt = `
      You are a local travel expert for ${city} (Lat: ${lat}, Lon: ${lon}).

      Current Weather: ${currentTemp}°C, ${currentDesc}
      Forecast:
      ${forecastSummary}

      TASK:
      Return a VALID JSON object containing a detailed travel plan.
    `;

    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              markdown_content: { type: "STRING" },
              activities: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
              packing_tips: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
              places: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    lat: { type: "NUMBER" },
                    lon: { type: "NUMBER" },
                    category: { type: "STRING" },
                    description: { type: "STRING" },
                  },
                  required: ["name", "lat", "lon", "category", "description"],
                },
              },
            },
            required: [
              "markdown_content",
              "activities",
              "packing_tips",
              "places",
            ],
          },
        },
      })
    );

    const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("Empty response from AI");
    }

    const data = JSON.parse(textResponse);

    return NextResponse.json({
      suggestion: data.markdown_content,
      places: data.places,
      activities: data.activities,
      packing_tips: data.packing_tips,
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate plan." },
      { status: error?.status || 500 }
    );
  }
}
