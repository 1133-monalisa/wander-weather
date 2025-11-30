// components/DestinationMap.tsx
'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'

const markerIcon = new L.Icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

export default function DestinationMap({ lat, lon, name }: { lat: number; lon: number; name: string }) {
  useEffect(() => {
    // Fix for default icon paths in Next.js environment
    // (only run in client)
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/marker-icon-2x.png',
      iconUrl: '/marker-icon.png',
      shadowUrl: '/marker-shadow.png'
    })
  }, [])

  return (
    <div className="h-96 w-full rounded-2xl shadow overflow-hidden">
      <MapContainer center={[lat, lon]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lon]} icon={markerIcon}>
          <Popup>
            <strong>{name}</strong>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
