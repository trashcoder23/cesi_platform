'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { RiskBadge } from '@/components/risk-badge'
import {
  getForecast,
  getInfrastructureRisk,
  getCitiesRanking,
  ForecastData,
  InfrastructureRisk,
  RankingCity,
} from '@/lib/api'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  Tooltip as ReTooltip,
} from 'recharts'

export default function CityDetailPage() {
  const params = useParams()
  const cityName = decodeURIComponent(params.name as string)

  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [infrastructure, setInfrastructure] =
    useState<InfrastructureRisk | null>(null)
  const [ranking, setRanking] = useState<RankingCity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      const [forecastData, infraData, rankingData] = await Promise.all([
        getForecast(cityName),
        getInfrastructureRisk(cityName),
        getCitiesRanking(),
      ])

      setForecast(forecastData)
      setInfrastructure(infraData)
      setRanking(rankingData.find(c => c.city === cityName) || null)
      setLoading(false)
    }

    loadData()
  }, [cityName])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!forecast || !infrastructure || !ranking) return null

  // Derived metrics (model-based insights)
  const heatwaveProbability =
    ranking.instability_momentum > 15 ? 'High' : 'Moderate'

  const extremeHeatDays =
    Math.round(ranking.instability_probability * 40)

  const urbanHeatMultiplier =
    (1 + ranking.instability_probability).toFixed(2)

  const trendData = [
    { year: 'Now', aqi: forecast.current_aqi_mean, cesi: ranking.cesi },
    {
      year: 'Year 3',
      aqi: forecast.projected_aqi_3_years,
      cesi: forecast.projected_cesi,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">

        <Link
          href="/cities"
          className="text-primary hover:underline mb-6 inline-block text-sm"
        >
          ← Back to Cities
        </Link>

        <h1 className="text-4xl font-bold mb-4">{cityName}</h1>

        <p className="text-sm text-muted-foreground mb-10">
          All values shown below are model-derived normalized climate
          indicators used for comparative structural resilience analysis.
        </p>

        {/* CORE METRICS */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-card border border-border p-6 rounded-lg">
            <p className="text-sm text-muted-foreground">
              CESI Score
            </p>
            <p className="text-3xl font-bold">{ranking.cesi}</p>
            <RiskBadge
            label={ranking.risk_level}
            />
          </div>

          <div className="bg-card border border-border p-6 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Instability Probability
            </p>
            <p className="text-3xl font-bold">
              {(ranking.instability_probability * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-card border border-border p-6 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Instability Momentum
            </p>
            <p className="text-3xl font-bold">
              {ranking.instability_momentum}
            </p>
          </div>
        </section>

        {/* TREND VISUALIZATION */}
        <section className="bg-card border border-border rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">
            3-Year Projection Trend
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="year" />
                <ReTooltip />
                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke="#DC2626"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="cesi"
                  stroke="#2563EB"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* HEATWAVE RISK */}
        <section className="bg-card border border-border rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">
            Heatwave Risk Assessment
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Heatwave Probability
              </p>
              <p className="text-xl font-bold">
                {heatwaveProbability}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Extreme Heat Days (Projected)
              </p>
              <p className="text-xl font-bold">
                {extremeHeatDays} days/year
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Urban Heat Amplification
              </p>
              <p className="text-xl font-bold">
                {urbanHeatMultiplier}x baseline
              </p>
            </div>
          </div>
        </section>

        {/* INFRASTRUCTURE VULNERABILITY */}
        <section className="bg-card border border-border rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">
            Infrastructure Vulnerability
          </h2>

          <div className="flex flex-wrap gap-3">
            {infrastructure.high_risk_sectors.map(sector => (
              <div
                key={sector}
                className="bg-secondary px-4 py-2 rounded-full text-sm"
              >
                {sector}
              </div>
            ))}
          </div>
        </section>

        {/* CLIMATE DRIVERS */}
        <section className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">
            Primary Climate Stress Drivers
          </h2>

          <ul className="space-y-3 text-muted-foreground">
            {ranking.instability_probability > 0.7 && (
              <li>• High structural instability probability</li>
            )}
            {ranking.instability_momentum > 10 && (
              <li>• Rapidly accelerating climate stress momentum</li>
            )}
            {forecast.projected_cesi < ranking.cesi && (
              <li>• Projected decline in resilience index</li>
            )}
            <li>• Air quality volatility contributing to public health burden</li>
            <li>• Infrastructure strain under projected extreme heat scenarios</li>
          </ul>
        </section>
      </main>
    </div>
  )
}