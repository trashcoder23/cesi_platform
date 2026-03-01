'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { CityCard } from '@/components/city-card'
import { ImportanceChart } from '@/components/importance-chart'
import { GlobalMetrics } from '@/components/global-metrics'
import { HeatMap } from '@/components/heatmap'
import {
  getCitiesRanking,
  getModelImportance,
  RankingCity,
  ModelImportance,
} from '@/lib/api'

export default function Home() {
  const [cities, setCities] = useState<RankingCity[]>([])
  const [importance, setImportance] = useState<ModelImportance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapMode, setMapMode] = useState<'risk' | 'probability' | 'momentum'>('risk')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        const [rankingData, modelData] = await Promise.all([
          getCitiesRanking(),
          getModelImportance(),
        ])

        setCities(rankingData)
        setImportance(modelData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">

        {/* HERO */}
        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Global Climate Risk Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Explore structural climate stress and infrastructure risk across major global cities.
          </p>

          <Link href="/cities">
            <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              Explore All Cities
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            <GlobalMetrics data={cities} />

            {/* MAP MODE TOGGLE */}
            <div className="flex gap-3 mb-6">
              {['risk', 'probability', 'momentum'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition
                    ${mapMode === mode ? 'bg-primary text-white' : 'bg-secondary'}
                  `}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>

            <HeatMap
              data={cities}
              mode={mapMode}
              onSelect={setSelectedCity}
            />
            <section className="bg-card border border-border rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6">
              What is CESI?
            </h2>

            <p className="text-muted-foreground mb-4">
              The Climate & Environmental Structural Index (CESI) is a composite
              resilience score measuring a city's vulnerability to climate-driven
              structural stress.
            </p>

            <ul className="space-y-2 text-muted-foreground">
              <li>• Temperature stress projections</li>
              <li>• Normalized air quality volatility</li>
              <li>• Infrastructure risk exposure</li>
              <li>• Instability probability modeling</li>
              <li>• Instability momentum forecasting</li>
            </ul>

            <p className="mt-6 text-sm text-muted-foreground">
              Lower CESI values indicate higher structural climate risk, while
              higher scores indicate greater systemic resilience.
            </p>
          </section>

            {/* EXPLANATION PANEL */}
            {selectedCity && (
              <div className="bg-card border border-border rounded-lg p-6 mb-16">
                <h3 className="text-xl font-bold mb-4">
                  Why {selectedCity} is High Risk
                </h3>

                {(() => {
                  const city = cities.find(c => c.city === selectedCity)
                  if (!city) return null

                  return (
                    <ul className="space-y-2 text-muted-foreground">
                      {city.instability_probability > 0.7 && (
                        <li>• High structural instability probability</li>
                      )}
                      {city.instability_momentum > 10 && (
                        <li>• Accelerating climate stress momentum</li>
                      )}
                      {city.cesi < 30 && (
                        <li>• Critically low CESI resilience score</li>
                      )}
                    </ul>
                  )
                })()}
              </div>
            )}

            {/* TOP 6 */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8">
                Highest Risk Cities
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.slice(0, 6).map((city) => (
                  <CityCard
                    key={city.city}
                    name={city.city}
                    score={city.cesi}
                    riskLevel={city.risk_level}
                    highlighted={selectedCity === city.city}
                    href={`/city/${encodeURIComponent(city.city)}`}
                  />
                ))}
              </div>
            </section>

            {importance.length > 0 && (
              <section className="bg-card border border-border rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-8">
                  Model Feature Importance
                </h2>
                <ImportanceChart data={importance} />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}