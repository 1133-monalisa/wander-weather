// app/api/weather/route.ts
import { NextResponse } from 'next/server';

type GeoResult = {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    if (!q) return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 });

    const key = process.env.OWM_API_KEY;
    if (!key) return NextResponse.json({ error: 'Missing OWM_API_KEY on server' }, { status: 500 });

    // 1) Geocode
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${key}`
    );
    const geoJson = await geoRes.json();
    if (!geoRes.ok) return NextResponse.json(geoJson, { status: geoRes.status });
    if (!Array.isArray(geoJson) || geoJson.length === 0) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    const geo = geoJson[0] as GeoResult;
    const { lat, lon, name, country, state } = geo;

    // 2) Fetch free endpoints: current weather + 5-day forecast (3-hour intervals)
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}`)
    ]);

    const currentJson = await currentRes.json();
    const forecastJson = await forecastRes.json();

    if (!currentRes.ok) return NextResponse.json(currentJson, { status: currentRes.status });
    if (!forecastRes.ok) return NextResponse.json(forecastJson, { status: forecastRes.status });

    // 3) Convert 3-hour forecast into 7 daily summaries (avg temp, common description, avg pop)
    type ForecastItem = {
      dt: number;
      main: { temp: number };
      weather: { description: string }[];
      pop?: number;
    };

    const list: ForecastItem[] = Array.isArray(forecastJson.list) ? forecastJson.list : [];

    // Group temps and descriptions by date (YYYY-MM-DD)
    const dayMap: Record<
      string,
      {
        temps: number[];
        pops: number[];
        descCounts: Record<string, number>;
        dtFirst: number;
      }
    > = {};

    for (const it of list) {
      const dateStr = new Date(it.dt * 1000).toISOString().split('T')[0];
      if (!dayMap[dateStr]) {
        dayMap[dateStr] = { temps: [], pops: [], descCounts: {}, dtFirst: it.dt };
      }
      dayMap[dateStr].temps.push(it.main.temp);
      if (typeof it.pop === 'number') dayMap[dateStr].pops.push(it.pop);
      const desc = (it.weather?.[0]?.description || 'clear').toLowerCase();
      dayMap[dateStr].descCounts[desc] = (dayMap[dateStr].descCounts[desc] || 0) + 1;
    }

    const daily = Object.entries(dayMap)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(0, 7)
      .map(([date, info]) => {
        const avgTemp = info.temps.reduce((a, b) => a + b, 0) / Math.max(1, info.temps.length);
        const avgPop = info.pops.length ? info.pops.reduce((a, b) => a + b, 0) / info.pops.length : 0;
        const mostCommonDesc = Object.entries(info.descCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'clear';
        return {
          dt: info.dtFirst,
          temp: { day: avgTemp },
          pop: avgPop,
          weather: [{ description: capitalize(mostCommonDesc) }]
        };
      });

    // 4) Shape current into a consistent small object
    const shapedCurrent = {
      temp: currentJson.main?.temp ?? null,
      feels_like: currentJson.main?.feels_like ?? null,
      humidity: currentJson.main?.humidity ?? null,
      wind_speed: currentJson.wind?.speed ?? null,
      weather: Array.isArray(currentJson.weather) ? currentJson.weather : [{ description: 'N/A' }],
      sunrise: currentJson.sys?.sunrise ?? null,
      sunset: currentJson.sys?.sunset ?? null,
      timezone_offset: forecastJson.city?.timezone ?? 0 // forecast has city.timezone (seconds)
    };

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

function capitalize(s: string) {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}
