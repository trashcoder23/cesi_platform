'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import type { RankingCity } from '@/lib/api'

const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
)

const CircleMarker = dynamic(
  () => import('react-leaflet').then(mod => mod.CircleMarker),
  { ssr: false }
)

const Tooltip = dynamic(
  () => import('react-leaflet').then(mod => mod.Tooltip),
  { ssr: false }
)

interface Props {
  data: RankingCity[]
  mode: 'risk' | 'probability' | 'momentum'
  onSelect?: (city: string) => void
}

const coords: Record<string, [number, number]> = {
  Bangkok: [13.7563, 100.5018],
  Beijing: [39.9042, 116.4074],
  Delhi: [28.6139, 77.2090],
  Manila: [14.5995, 120.9842],
  Cairo: [30.0444, 31.2357],
  Karachi: [24.8607, 67.0011],
  Mumbai: [19.0760, 72.8777],
  Lagos: [6.5244, 3.3792],
  "Mexico City": [19.4326, -99.1332],
  Jakarta: [-6.2088, 106.8456],
  Vancouver: [49.2827, -123.1207],
  Oslo: [59.9139, 10.7522],
  Toronto: [43.6532, -79.3832],
  Vienna: [48.2082, 16.3738],
  Paris: [48.8566, 2.3522],
  Melbourne: [-37.8136, 144.9631],
  Chicago: [41.8781, -87.6298],
  Seoul: [37.5665, 126.9780],
  Tokyo: [35.6762, 139.6503],
  Lisbon: [38.7223, -9.1393],
  Helsinki: [60.1699, 24.9384],
  Rome: [41.9028, 12.4964],
  Sydney: [-33.8688, 151.2093],
  Stockholm: [59.3293, 18.0686],
  Singapore: [1.3521, 103.8198],
  Madrid: [40.4168, -3.7038],
  Zurich: [47.3769, 8.5417],
  Copenhagen: [55.6761, 12.5683],
  Reykjavik: [64.1466, -21.9426],
  Berlin: [52.5200, 13.4050],
}

function getColor(city: RankingCity, mode: string) {
  if (mode === 'risk') {
    if (city.risk_level === 'Critical') return '#DC2626'
    if (city.risk_level === 'Warning') return '#F97316'
    return '#16A34A'
  }

  if (mode === 'probability') {
    return city.instability_probability > 0.7
      ? '#DC2626'
      : city.instability_probability > 0.4
      ? '#F97316'
      : '#16A34A'
  }

  return city.instability_momentum > 10
    ? '#DC2626'
    : city.instability_momentum > 0
    ? '#F97316'
    : '#16A34A'
}

export function HeatMap({ data, mode, onSelect }: Props) {
  const router = useRouter()

  return (
    <div className="mb-16 border border-border rounded-lg overflow-hidden">
      <MapContainer
        center={[20, 0] as [number, number]}
        zoom={2}
        scrollWheelZoom={false}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {data.map(city => {
          const position = coords[city.city]
          if (!position) return null

          return (
            <CircleMarker
              key={city.city}
              center={position}
              radius={8}
              pathOptions={{
                color: getColor(city, mode),
                fillColor: getColor(city, mode),
                fillOpacity: 0.7,
              }}
              eventHandlers={{
                click: () => onSelect?.(city.city),
              }}
            >
              <Tooltip>
                <div className="text-sm">
                  <strong>{city.city}</strong>
                  <br />
                  CESI: {city.cesi}
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}