// app/destination/page.tsx
import Link from 'next/link'
import WeatherCard from '../../components/WeatherCard'
import DestinationHeader from '@/components/DestinationHeader'
import ReviewsList from '@/components/ReviewsList'


type GeocodeResult = {
  place_id: string
  display_name: string
  lat: string
  lon: string
  address?: { [k: string]: string }
}

export const revalidate = 60 // optional ISR for server component

export default async function DestinationPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = (searchParams?.q ?? '').trim()

  if (!q) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Find a destination</h1>
        <p className="mt-2 text-muted-foreground">Type a city or place in the search box on the header, or use the form below.</p>
        <form action="/destination" method="get" className="mt-4 flex gap-2">
          <input name="q" placeholder="e.g. Kathmandu" className="px-3 py-2 rounded-lg border w-full max-w-md" />
          <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 text-white">Search</button>
        </form>
      </div>
    )
  }

  // Server-side geocoding using Nominatim (OpenStreetMap)
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1`
  let geocode: GeocodeResult | null = null
  try {
    const res = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'WanderWeather/1.0 (+https://yourdomain.example)'
      },
      // optional: set cache to control frequency
      next: { revalidate: 60 }
    })
    const arr = (await res.json()) as GeocodeResult[]
    if (arr && arr.length > 0) {
      geocode = arr[0]
    }
  } catch (err) {
    console.error('Geocode error:', err)
  }

  if (!geocode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold">No results for “{q}”</h2>
        <p className="mt-2 text-muted-foreground">Try a different spelling or add a country (e.g. "Kathmandu, Nepal").</p>
        <Link href="/"><button className="mt-4 px-4 py-2 rounded-lg border">Back</button></Link>
      </div>
    )
  }

  const lat = Number(geocode.lat)
  const lon = Number(geocode.lon)
  const displayName = geocode.display_name
  const country = geocode.address?.country ?? ''

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <DestinationHeader name={displayName} country={country} lat={lat} lon={lon} query={q} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Map (client) */}
          {/* Import client-side DestinationMap dynamically to avoid SSR issues */}
          <DynamicDestinationMap lat={lat} lon={lon} name={displayName} />

          {/* 7-day / hourly forecast (WeatherCard shows current; you can add ForecastPanel) */}
          <div className="mt-4">
            <WeatherCard lat={lat} lon={lon} units="metric" />
          </div>

          {/* Reviews (client-side) */}
          <ReviewsList placeId={geocode.place_id} />
        </div>

        <aside className="space-y-4">
          <div className="card p-4 rounded-2xl shadow">
            <h3 className="font-semibold">Quick plan</h3>
            <p className="text-sm text-muted-foreground mt-2">Pick best dates, packing list, and local tips.</p>
            <Link href={`/planner?destination=${encodeURIComponent(q)}&lat=${lat}&lon=${lon}`}>
              <button className="mt-3 w-full px-4 py-2 rounded-lg bg-emerald-600 text-white">Plan Trip</button>
            </Link>
          </div>

          <div className="card p-4 rounded-2xl shadow">
            <h4 className="font-semibold">Location</h4>
            <p className="mt-2 text-sm">{displayName}</p>
            <p className="text-xs text-muted-foreground mt-2">Lat: {lat.toFixed(4)} • Lon: {lon.toFixed(4)}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

