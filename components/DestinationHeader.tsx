// components/DestinationHeader.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DestinationHeader({ name, country, lat, lon, query }: { name: string; country: string; lat: number; lon: number; query: string }) {
  const [visited, setVisited] = useState(false)
  const [following, setFollowing] = useState(false)

  return (
    <header className="bg-card p-4 rounded-2xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-sm text-muted-foreground">{country}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/planner?destination=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}`}>
          <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Plan Trip</button>
        </Link>

        <button
          onClick={() => setVisited((v) => !v)}
          className={'px-3 py-2 rounded-lg border ' + (visited ? 'bg-sky-600 text-white' : '')}
        >
          {visited ? 'Visited ✓' : 'Mark Visited'}
        </button>

        <button onClick={() => setFollowing((f) => !f)} className={'px-3 py-2 rounded-lg border ' + (following ? 'bg-sky-600 text-white' : '')}>
          {following ? 'Following' : 'Follow'}
        </button>
      </div>
    </header>
  )
}
