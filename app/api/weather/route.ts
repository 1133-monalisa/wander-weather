// app/api/weather/route.ts
import { NextResponse } from 'next/server';

type GeoResult = {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    if (!q) return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 });

    // 1) Geocode via Open-Meteo (no API key)
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1`
    );
    const geoJson = await geoRes.json();
    if (!geoRes.ok) return NextResponse.json(geoJson, { status: geoRes.status });
    if (!geoJson.results || geoJson.results.length === 0) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const geo = geoJson.results[0] as GeoResult;
    const { latitude: lat, longitude: lon, name, country, admin1: state } = geo;

    // 2) Fetch forecast + current (daily fields include sunrise/sunset in local timezone ISO strings)
    const url = [
      `https://api.open-meteo.com/v1/forecast`,
      `?latitude=${lat}`,
      `&longitude=${lon}`,
      `&current_weather=true`,
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean,weathercode,sunrise,sunset`,
      `&timezone=auto`
    ].join('');

    const weatherRes = await fetch(url);
    const weatherJson = await weatherRes.json();
    if (!weatherRes.ok) return NextResponse.json(weatherJson, { status: weatherRes.status });

    // 3) Shape response to match your frontend expectations (plus include weathercode for icons)
    const currentWeather = weatherJson.current_weather ?? null;

    const shapedCurrent = {
      temp: currentWeather?.temperature ?? null,
      wind_speed: currentWeather?.windspeed ?? null,
      weather: [{ description: codeToDescription(currentWeather?.weathercode), code: currentWeather?.weathercode ?? null }],
      sunrise:
        Array.isArray(weatherJson.daily?.sunrise) && weatherJson.daily.sunrise[0]
          ? Math.floor(new Date(weatherJson.daily.sunrise[0]).getTime() / 1000)
          : null,
      sunset:
        Array.isArray(weatherJson.daily?.sunset) && weatherJson.daily.sunset[0]
          ? Math.floor(new Date(weatherJson.daily.sunset[0]).getTime() / 1000)
          : null,
      timezone_offset: 0, // timezone already applied by API (we keep compatibility field)
      weathercode: currentWeather?.weathercode ?? null
    };

    const times: string[] = weatherJson.daily?.time ?? [];
    const maxArr: number[] = weatherJson.daily?.temperature_2m_max ?? [];
    const minArr: number[] = weatherJson.daily?.temperature_2m_min ?? [];
    const popArr: number[] = weatherJson.daily?.precipitation_probability_mean ?? [];
    const codeArr: number[] = weatherJson.daily?.weathercode ?? [];

    const daily = times.map((t: string, i: number) => ({
      dt: Math.floor(new Date(t).getTime() / 1000),
      temp: {
        day: typeof maxArr[i] === 'number' && typeof minArr[i] === 'number' ? (maxArr[i] + minArr[i]) / 2 : (maxArr[i] ?? minArr[i] ?? null),
        max: typeof maxArr[i] === 'number' ? maxArr[i] : null,
        min: typeof minArr[i] === 'number' ? minArr[i] : null
      },
      pop: typeof popArr[i] === 'number' ? popArr[i] / 100 : 0,
      weather: [{ description: codeToDescription(codeArr?.[i]), code: codeArr?.[i] ?? null }]
    }));

    const payload = {
      location: { name, country, state, lat, lon },
      weather: { current: shapedCurrent, daily }
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    console.error('/api/weather error', err);
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 });
  }
}

// Convert Open-Meteo weather codes to human descriptions
function codeToDescription(code?: number): string {
  if (code === undefined || code === null) return 'Unknown';
  const table: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  return table[code] || 'Unknown';
}
