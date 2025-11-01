'use client';
import React, { useState, FormEvent } from 'react';

type Daily = {
  dt: number;
  temp: { day: number };
  pop?: number;
  weather: { description: string }[];
};

type Current = {
  temp: number | null;
  feels_like: number | null;
  humidity: number | null;
  wind_speed: number | null;
  weather: { description: string }[];
  sunrise?: number | null;
  sunset?: number | null;
  timezone_offset?: number;
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

export default function Page() {
  const [query, setQuery] = useState('');
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    if (!query.trim()) {
      setError('Please enter a destination');
      return;
    }
    setError(null);
    setLoading(true);
    setPayload(null);

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
      setPayload(data as Payload);
      // smooth scroll so results appear on mobile
      window.scrollTo({ top: 300, behavior: 'smooth' });
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

  function formatTime(ts?: number | null, tzOffset?: number) {
    if (!ts) return '-';
    const d = new Date((ts + (tzOffset ?? 0)) * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(ts?: number) {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-slate-800">
      <header className="mx-auto p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white rounded-lg p-2 shadow-md">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Wander Weather</h1>
            <p className="text-xs sm:text-sm text-slate-600">Free-tier weather + travel suggestions</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-sm text-slate-700">
          <a className="hover:underline" href="#planner">Planner</a>
          <a className="hover:underline" href="#features">Features</a>
          <a className="hover:underline" href="#contact">Contact</a>
        </nav>
      </header>

      <main className="mx-auto px-4 sm:px-6 pb-12">
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm -mt-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold">Find the best days to travel — by weather</h2>
              <p className="mt-1 text-sm text-slate-600">Type a city (e.g., Kathmandu, Paris) and get free weather-aware suggestions.</p>
            </div>

            <form onSubmit={handleSearch} className="w-full sm:w-2/3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-inner">
                <input
                  aria-label="Search destination"
                  className="flex-1 bg-transparent p-3 text-sm outline-none"
                  placeholder="e.g., Kathmandu"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium shadow hover:bg-indigo-700 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Searching…' : 'Search'}
                </button>
              </div>
              {error && <div role="alert" className="mt-2 text-xs text-red-600">{error}</div>}
            </form>
          </div>
        </section>

        <section className="mt-6">
          {!payload && (
            <div className="rounded-xl p-6 bg-white/70 border border-dashed border-slate-200 text-center">
              <p className="text-sm text-slate-600">Search to reveal current conditions, a 7-day outlook, packing tips, and activity suggestions.</p>
            </div>
          )}

          {payload && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {payload.location.name}{payload.location.state ? `, ${payload.location.state}` : ''}, {payload.location.country}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-extrabold">
                      {safeRound(payload.weather.current.temp) ?? '--'}°C
                    </div>
                    <div className="text-xs text-slate-500">
                      Feels like {safeRound(payload.weather.current.feels_like) ?? '--'}°C
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs">Humidity</div>
                    <div className="font-medium">{payload.weather.current.humidity ?? '-' }%</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs">Wind</div>
                    <div className="font-medium">{safeRound(payload.weather.current.wind_speed) ?? '-'} m/s</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs">Sunrise</div>
                    <div className="font-medium">{formatTime(payload.weather.current.sunrise, payload.weather.current.timezone_offset)}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs">Sunset</div>
                    <div className="font-medium">{formatTime(payload.weather.current.sunset, payload.weather.current.timezone_offset)}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium">Packing suggestions</h4>
                  <ul className="mt-2 list-disc ml-5 text-sm text-slate-600">
                    { (payload.weather.current.temp ?? 0) >= 25 ? (
                      <>
                        <li>Light layers, sun protection</li>
                        <li>Reusable water bottle</li>
                      </>
                    ) : (
                      <>
                        <li>Layered clothing</li>
                        <li>Light rain jacket</li>
                      </>
                    )}
                    { (payload.weather.daily?.[0]?.pop ?? 0) > 0.5 && <li>Waterproof footwear</li> }
                  </ul>
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${payload.location.name}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-xs bg-indigo-50 text-indigo-700 py-2 rounded-md text-center"
                  >
                    Open in Maps
                  </a>
                  <button
                    onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    className="flex-1 text-xs bg-slate-100 text-slate-700 py-2 rounded-md"
                  >
                    Copy link
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
                  <h3 className="text-lg font-semibold">7-day outlook</h3>
                  <div className="mt-3 overflow-x-auto">
                    <div className="flex gap-3 py-2">
                      {payload.weather.daily.slice(0, 7).map((d, i) => (
                        <div key={i} className="min-w-[110px] p-3 bg-slate-50 rounded-lg text-center">
                          <div className="text-xs text-slate-500">{formatDate(d.dt)}</div>
                          <div className="mt-2 font-semibold">{safeRound(d.temp.day) ?? '--'}°C</div>
                          <div className="text-xs capitalize text-slate-600 mt-1">{d.weather?.[0]?.description ?? '-'}</div>
                          <div className="text-xs text-slate-500 mt-1">Rain {Math.round((d.pop ?? 0) * 100)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-slate-600">
                    { (payload.weather.daily?.[0]?.pop ?? 0) > 0.6 ? (
                      <p>High chance of rain — prefer indoor activities: museums, cafes, workshops.</p>
                    ) : (payload.weather.current.temp ?? 0) >= 20 ? (
                      <p>Great outdoor weather — walking tours, parks, and local markets recommended.</p>
                    ) : (
                      <p>Cooler conditions — scenic drives, short hikes, or cozy indoor experiences.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Map & preview</h3>
                    <span className="text-xs text-slate-500">Interactive map later</span>
                  </div>
                  <div className="mt-3 h-48 bg-slate-100 rounded-md flex items-center justify-center text-sm text-slate-500">
                    {payload.location.lat && payload.location.lon ? (
                      <div>
                        <div><strong>Lat:</strong> {payload.location.lat.toFixed(3)} &nbsp; <strong>Lon:</strong> {payload.location.lon.toFixed(3)}</div>
                        <div className="mt-2 text-xs">Replace with a map component (Leaflet/Mapbox)</div>
                      </div>
                    ) : <div>No coordinates</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section id="features" className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h5 className="text-sm font-semibold">Historical Weather</h5>
            <p className="text-xs text-slate-600 mt-2">Compare past trends to plan better trips.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h5 className="text-sm font-semibold">Packing Lists</h5>
            <p className="text-xs text-slate-600 mt-2">Auto-generated packing suggestions.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h5 className="text-sm font-semibold">Eco Tips</h5>
            <p className="text-xs text-slate-600 mt-2">Sustainable travel suggestions per destination.</p>
          </div>
        </section>

        <footer id="contact" className="mt-8 mb-8 text-xs text-slate-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>Team Wander Weather — Prativa Secondary School</div>
            <div className="text-slate-500">Built with Next.js + Tailwind • Mobile-first responsive UI</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
