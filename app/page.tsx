'use client';
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Cloud, Droplets, Wind, Sunrise, Sunset, ThermometerSun, Calendar, Navigation, MapPin, Umbrella } from 'lucide-react';

// Leaflet / react-leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// these imports provide the marker images when bundlers resolve them
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet's default icon paths so the marker shows up correctly in many bundlers
if (typeof L !== 'undefined') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: (markerIcon2x as any)?.src || markerIcon2x,
    iconUrl: (markerIcon as any)?.src || markerIcon,
    shadowUrl: (markerShadow as any)?.src || markerShadow,
  });
}

type Daily = {
  dt: number;
  temp: { day: number | null; max?: number | null; min?: number | null };
  pop?: number;
  weather: { description: string; code?: number | null }[];
};

type Current = {
  temp: number | null;
  feels_like?: number | null;
  humidity?: number | null;
  wind_speed?: number | null;
  weather: { description: string; code?: number | null }[];
  sunrise?: number | null;
  sunset?: number | null;
  timezone_offset?: number;
  weathercode?: number | null;
};

type Payload = {
  location: {
    name: string;
    country: string;
    state?: string;
    lat?: number;
    lon?: number;
  };
  weather: {
    current: Current;
    daily: Daily[];
  };
};

// A small helper component to update map view when the props change
function MapAutoCenter({ lat, lon, zoom = 10 }: { lat: number; lon: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    map.setView([lat, lon], zoom, { animate: true });
  }, [lat, lon, zoom, map]);
  return null;
}

export default function Page() {
  const [query, setQuery] = useState('');
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestionRaw, setSuggestionRaw] = useState<string | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const [showMap, setShowMap] = useState(true);

  function sanitizeSuggestion(raw: any) {
    if (raw === undefined || raw === null) return null;
    let text = typeof raw === 'string' ? raw : String(raw);
    // Normalize newlines & remove stray repeated asterisks used oddly
    text = text.replace(/\r\n/g, '\n').replace(/\*\s*\*/g, '**');
    // Collapse many blank lines to max two
    text = text.replace(/\n{3,}/g, '\n\n');
    // Trim each line
    text = text.split('\n').map(l => l.trim()).join('\n');
    // Remove any stray invisible chars
    text = text.replace(/\u200B/g, '');
    return text.trim();
  }

  async function fetchSuggestion(weatherPayload: Payload) {
    setSuggestionLoading(true);
    setSuggestionError(null);
    setSuggestionRaw(null);

    try {
      const body = JSON.stringify(weatherPayload);
      const res = await fetch('/api/suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (!res.ok) {
        const msg = typeof data === 'string' ? data : JSON.stringify(data);
        throw new Error(msg);
      }

      // API returns { suggestion: '...' } normally
      const raw = (data && (data.suggestion ?? data)) || '';
      setSuggestionRaw(sanitizeSuggestion(raw));
    } catch (err: any) {
      console.error('Suggestion fetch error:', err);
      setSuggestionError(err?.message || 'Failed to fetch trip suggestion.');
    } finally {
      setSuggestionLoading(false);
    }
  }

  async function handleSearch() {
    if (!query.trim()) {
      setError('Please enter a destination');
      return;
    }
    setError(null);
    setLoading(true);
    setPayload(null);
    setSuggestionRaw(null);
    setSuggestionError(null);

    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(query.trim())}`);
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      if (!res.ok) {
        const msg = typeof data === 'string' ? data : JSON.stringify(data);
        throw new Error(msg);
      }

      const newPayload = data as Payload;
      setPayload(newPayload);
      window.scrollTo({ top: 300, behavior: 'smooth' });
      fetchSuggestion(newPayload);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }

  function safeRound(n: number | null | undefined) {
    return typeof n === 'number' && !Number.isNaN(n) ? Math.round(n) : null;
  }

  function getFirstNumeric(obj: any, keys: string[], fallback: number | null = null) {
    if (!obj) return fallback;
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === 'number' && !Number.isNaN(v)) return v;
      if (typeof v === 'string') {
        const parsed = Number(v);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
    return fallback;
  }

  function formatTime(ts?: number | null, tzOffset?: number) {
    if (!ts) return '-';
    const d = new Date((ts + (tzOffset ?? 0)) * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(ts?: number, short?: boolean) {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    return short
      ? d.toLocaleDateString(undefined, { weekday: 'short' })
      : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // Parse the AI suggestion into ordered labeled sections.
  // Expects bold labels like: **Activity Recommendations:** then content (bullets/lines)
  function extractSections(raw: string | null) {
    if (!raw) return { order: [], sections: {} as Record<string, string> };

    const sections: Record<string, string> = {};
    const order: string[] = [];

    // Regex to find **Label:** content (non-greedy) until next bold label or end
    const labelRegex = /\*\*(.+?)\*\*\s*[:\-–—]?\s*([\s\S]*?)(?=(\*\*.+?\*\*\s*[:\-–—]?\s*)|$)/g;

    let match;
    while ((match = labelRegex.exec(raw)) !== null) {
      const label = match[1].trim();
      const content = match[2].trim();
      if (!sections[label]) {
        sections[label] = content;
        order.push(label);
      } else {
        // append if duplicated
        sections[label] += '\n\n' + content;
      }
    }

    // Fallback: if no labeled sections found, try to split by double newlines into generic sections
    if (order.length === 0) {
      const blocks = raw.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
      if (blocks.length === 1) {
        sections['Recommendations'] = blocks[0];
        order.push('Recommendations');
      } else {
        blocks.forEach((b, i) => {
          const key = i === 0 ? 'Overview' : `Section ${i + 1}`;
          sections[key] = b;
          order.push(key);
        });
      }
    }

    return { order, sections };
  }

  function weatherIcon(code?: number | null) {
    if (code === null || code === undefined) return <Cloud className="w-6 h-6" />;
    if (code === 0 || code === 1) return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
    if (code === 2 || code === 3 || (code >= 45 && code <= 48)) return <Cloud className="w-6 h-6" />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 61 && code <= 65)) return <Droplets className="w-6 h-6" />;
    if ((code >= 71 && code <= 86) || code === 77) return <span className="text-xl">❄️</span>;
    if (code >= 95 && code <= 99) return <span className="text-xl">⚡</span>;
    return <Cloud className="w-6 h-6" />;
  }

  const chartData = payload?.weather.daily.slice(0, 7).map(d => ({
    day: formatDate(d.dt, true),
    fullDate: formatDate(d.dt),
    temp: safeRound(d.temp.day),
    max: safeRound(d.temp.max),
    min: safeRound(d.temp.min),
    pop: Math.round((d.pop || 0) * 100),
    desc: d.weather?.[0]?.description || ''
  })) || [];

  const parsed = extractSections(sanitizeSuggestion(suggestionRaw));
  const sectionsOrder = parsed.order;
  const sectionsMap = parsed.sections;

  // Keep the existing quick summary generator
  function generateSummary(raw: string | null, weather: Payload | null): string {
    if (!raw || !weather) return '';

    const slice = weather.weather.daily.slice(0, 7);
    const avgTemp = slice.reduce((sum, d) => sum + (d.temp.day || 0), 0) / Math.max(slice.length, 1);
    const maxTemp = Math.max(...slice.map(d => d.temp.max ?? -Infinity));
    const minTemp = Math.min(...slice.map(d => d.temp.min ?? Infinity));
    const avgRain = slice.reduce((sum, d) => sum + (d.pop || 0), 0) / Math.max(slice.length, 1);

    let summary = `**Weather Summary:** `;
    if (Number.isFinite(minTemp) && Number.isFinite(maxTemp)) {
      summary += `Expect ${Math.round(minTemp)}°C to ${Math.round(maxTemp)}°C over the next 7 days. `;
    }

    if (avgRain > 0.5) {
      summary += `High chance of rain — pack waterproof gear. `;
    } else if (avgRain > 0.3) {
      summary += `Moderate rain risk — bring a light rain jacket. `;
    } else {
      summary += `Generally dry — great for outdoor activities. `;
    }

    if (avgTemp > 20) {
      summary += `Warm and pleasant overall.`;
    } else if (avgTemp > 15) {
      summary += `Mild — light layers recommended.`;
    } else {
      summary += `Cooler — pack warm layers.`;
    }

    return summary;
  }

  const summary = generateSummary(sanitizeSuggestion(suggestionRaw), payload);

  // Determine coordinates (fallback to Kathmandu if not provided)
  const defaultLat = 27.7172453; // Kathmandu
  const defaultLon = 85.3239605;
  const lat = payload?.location?.lat ?? defaultLat;
  const lon = payload?.location?.lon ?? defaultLon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white rounded-lg p-2 shadow-md">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">Wander Weather</h1>
                <p className="text-sm text-slate-600">Weather-informed travel planning</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 transition-all duration-300 hover:shadow-md">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Plan your trip with weather insights</h2>
          <div className="flex gap-3">
            <input
              aria-label="Search destination"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              placeholder="Enter a city name (e.g., Paris, Tokyo, New York)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <div role="alert" className="mt-3 text-sm text-red-600 animate-pulse">{error}</div>}
        </div>

        {!payload && (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <MapPin className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Search for a destination</h3>
            <p className="text-slate-600">Get 7-day weather forecasts and AI-powered travel suggestions</p>
          </div>
        )}

        {payload && (
          <div className="space-y-6 animate-fade-in">
            {/* Current Weather Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Navigation className="w-6 h-6" />
                    {payload.location.name}
                    {payload.location.state && `, ${payload.location.state}`}
                  </h2>
                  <p className="text-slate-600">{payload.location.country}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-slate-900">
                    {safeRound(getFirstNumeric(payload.weather.current, ['temp'])) ?? '--'}°
                  </div>
                  <p className="text-slate-600 capitalize mt-1">
                    {payload.weather.current.weather?.[0]?.description || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg transition-all hover:bg-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                    <ThermometerSun className="w-4 h-4" />
                    <span>Feels like</span>
                  </div>
                  <p className="text-xl font-semibold text-slate-900">
                    {safeRound(getFirstNumeric(payload.weather.current, ['feels_like', 'temp'])) ?? '--'}°C
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg transition-all hover:bg-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                    <Droplets className="w-4 h-4" />
                    <span>Humidity</span>
                  </div>
                  <p className="text-xl font-semibold text-slate-900">
                    {safeRound(getFirstNumeric(payload.weather.current, ['humidity', 'hum', 'relative_humidity'])) ?? '--'}%
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg transition-all hover:bg-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                    <Wind className="w-4 h-4" />
                    <span>Wind Speed</span>
                  </div>
                  <p className="text-xl font-semibold text-slate-900">
                    {safeRound(getFirstNumeric(payload.weather.current, ['wind_speed', 'wind'])) ?? '--'} m/s
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg transition-all hover:bg-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                    <Sunrise className="w-4 h-4" />
                    <span>Sun Times</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatTime(payload.weather.current.sunrise, payload.weather.current.timezone_offset)} / {formatTime(payload.weather.current.sunset, payload.weather.current.timezone_offset)}
                  </p>
                </div>
              </div>

              {/* Map toggle */}
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="text-sm text-slate-600">Map showing the searched location (if available)</div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Show map</label>
                  <input type="checkbox" checked={showMap} onChange={() => setShowMap(v => !v)} className="rounded" />
                </div>
              </div>

              {/* Leaflet Map */}
              {showMap && (
                <div className="mt-4 h-64 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                  <MapContainer center={[lat, lon]} zoom={10} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapAutoCenter lat={lat} lon={lon} zoom={10} />
                    <Marker position={[lat, lon]}>
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{payload.location.name}, {payload.location.country}</div>
                          <div>{safeRound(getFirstNumeric(payload.weather.current, ['temp'])) ?? '--'}°C • {payload.weather.current.weather?.[0]?.description || 'N/A'}</div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>

            {/* Summary Card */}
            {summary && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-300 rounded-lg flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick Summary</h3>
                    <div className="prose prose-sm max-w-none text-slate-700">
                      <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7-Day Detailed Forecast Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                7-Day Detailed Forecast
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {payload.weather.daily.slice(0, 7).map((d, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 transition-all hover:shadow-md hover:scale-105 duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-slate-900">{formatDate(d.dt)}</div>
                      <div>{weatherIcon(d.weather?.[0]?.code)}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Temperature</span>
                        <span className="text-lg font-bold text-slate-900">{safeRound(d.temp.day) ?? '--'}°C</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-600">Max: {safeRound(d.temp.max) ?? '--'}°</span>
                        <span className="text-blue-600">Min: {safeRound(d.temp.min) ?? '--'}°</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-600 pt-2 border-t border-slate-200">
                        <Umbrella className="w-3 h-3" />
                        <span>Rain: {Math.round((d.pop ?? 0) * 100)}%</span>
                      </div>

                      <div className="text-xs text-slate-600 capitalize pt-1">
                        {d.weather?.[0]?.description || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Temperature Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Temperature Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    style={{ fontSize: '14px' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    style={{ fontSize: '14px' }}
                    label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { fontSize: '14px', fill: '#64748b' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => {
                      if (name === 'pop') return [`${value}%`, 'Rain Chance'];
                      return [`${value}°C`, name === 'temp' ? 'Day' : name === 'max' ? 'Max' : 'Min'];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="max"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#tempGradient)"
                    name="max"
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="temp"
                  />
                  <Line
                    type="monotone"
                    dataKey="min"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#06b6d4', r: 3 }}
                    name="min"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-500"></div>
                  <span className="text-slate-600">Day Temp</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-red-500"></div>
                  <span className="text-slate-600">Max Temp</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-cyan-500 border-dashed"></div>
                  <span className="text-slate-600">Min Temp</span>
                </div>
              </div>
            </div>

            {/* AI Suggestions - improved rendering */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="none">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="text-lg font-semibold text-slate-900">AI Travel Insights</h3>
              </div>

              {suggestionLoading && (
                <div className="flex items-center gap-3 text-slate-600 py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                  <span>Generating personalized suggestions...</span>
                </div>
              )}

              {suggestionError && (
                <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {suggestionError}
                </div>
              )}

              {!suggestionLoading && !suggestionError && !suggestionRaw && (
                <div className="text-slate-600">Suggestions will appear here once the AI finishes analyzing the forecast.</div>
              )}

              {!suggestionLoading && !suggestionError && suggestionRaw && (
                <div className="space-y-4">
                  {/* Show AI raw text at top as small preface if needed */}
                  <div className="text-xs text-slate-500">AI suggestion (short & scannable):</div>

                  {/* Render parsed sections in order */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sectionsOrder.map((label) => (
                      <div key={label} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {label}
                        </h4>
                        <div className="prose prose-sm max-w-none text-slate-700">
                          <ReactMarkdown>{sectionsMap[label]}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>

                
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-slate-600">
            Team Wander Weather — Prativa Secondary School
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
