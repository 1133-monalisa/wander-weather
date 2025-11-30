// components/WeatherCard.tsx
'use client'
import { useEffect, useState } from 'react'

type OWWeather = {
  temp: number
  feels_like?: number
  weather: { main?: string; description?: string; icon?: string }[]
}

export default function WeatherCard({ lat, lon, units = 'metric' }: { lat: number; lon: number; units?: string }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<OWWeather | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    setData(null)
    setProvider(null)

    fetch(`/api/weather?lat=${lat}&lon=${lon}&units=${units}`)
      .then(async (r) => {
        const text = await r.text()
        let json: any = {}
        try {
          json = JSON.parse(text)
        } catch (e) {
          json = { raw: text }
        }

        if (!r.ok) {
          const msg = json?.error || json?.provider || json?.raw || `Status ${r.status}`
          throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
        }

        // handle Open-Meteo wrapper: { provider, data }
        const prov = json.provider ?? 'unknown'
        const payload = json.data ?? json

        // Map Open-Meteo current_weather to our common shape:
        if (prov === 'open-meteo' && payload.current_weather) {
          const cw = payload.current_weather
          // Open-Meteo doesn't include icon; map weathercode -> simple text fallback
          const weatherDesc = `code:${cw.weathercode ?? 'n/a'}`
          return { provider: prov, data: { temp: cw.temperature, feels_like: cw.temperature, weather: [{ description: weatherDesc }] } }
        }

        // If OpenWeatherMap style (onecall)
        if (payload.current) {
          const cur = payload.current
          return { provider: prov || 'openweather', data: { temp: cur.temp, feels_like: cur.feels_like, weather: cur.weather } }
        }

        // If the API returned a simple weather object currently
        if (payload.temp || payload.temperature) {
          const t = payload.temp ?? payload.temperature
          const w = payload.weather ?? [{ description: payload.weathercode ?? 'n/a' }]
          return { provider: prov || 'unknown', data: { temp: t, feels_like: t, weather: w } }
        }

        throw new Error('Unrecognized weather payload')
      })
      .then((res) => {
        if (!mounted) return
        setProvider(res.provider)
        setData(res.data)
      })
      .catch((e: any) => {
        console.error('Weather fetch error (client):', e)
        setError(e?.message ?? String(e))
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [lat, lon, units])

  if (loading) return <div className="p-4 rounded-xl shadow card">Loading weather…</div>
  if (error) return <div className="p-4 rounded-xl shadow card">Error loading weather: {error}</div>
  if (!data) return <div className="p-4 rounded-xl shadow card">No weather data</div>

  const icon = data.weather?.[0]?.icon
  const descr = (data.weather?.[0]?.description as string) ?? data.weather?.[0]?.main ?? 'Unknown'

  return (
    <div className="p-4 rounded-2xl shadow card">
      <div className="flex items-center gap-4">
        {icon ? <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt={descr} width={64} height={64} /> : null}
        <div>
          <div className="text-2xl font-bold">{Math.round(data.temp)}°</div>
          <div className="text-sm text-muted-foreground">{descr}</div>
          <div className="text-xs mt-1">Feels like {Math.round(data.feels_like ?? data.temp)}°</div>
          {provider ? <div className="text-xs mt-1 text-muted-foreground">Source: {provider}</div> : null}
        </div>
      </div>
    </div>
  )
}
