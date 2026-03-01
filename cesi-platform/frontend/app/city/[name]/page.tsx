'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { RiskBadge } from '@/components/risk-badge';
import {
  getForecast,
  getInfrastructureRisk,
  ForecastData,
  InfrastructureRisk,
} from '@/lib/api';

export default function CityDetailPage() {
  const params = useParams();
  const cityName = decodeURIComponent(params.name as string);

  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [infrastructure, setInfrastructure] = useState<InfrastructureRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [forecastData, infraData] = await Promise.all([
          getForecast(cityName),
          getInfrastructureRisk(cityName),
        ]);

        setForecast(forecastData);
        setInfrastructure(infraData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load city data');
        console.error('Error loading city detail:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [cityName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/cities" className="text-primary hover:underline mb-6 inline-block text-sm">
          ← Back to Cities
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-8">
          {cityName}
        </h1>

        {error && (
          <div className="mb-8 bg-red-100 border border-red-400 rounded-lg p-4 text-red-700">
            <p className="font-semibold">Error loading data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Forecast Section */}
        {forecast && (
          <section className="mb-12 bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">3-Year Climate Forecast</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Current AQI Mean</p>
                <p className="text-3xl font-bold text-accent">
                  {forecast.current_aqi_mean.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Projected AQI (3 Years)</p>
                <p className="text-3xl font-bold text-accent">
                  {forecast.projected_aqi_3_years.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Projected CESI</p>
                <p className="text-3xl font-bold text-accent">
                  {forecast.projected_cesi.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Forecast Risk Level</p>
                <RiskBadge label={forecast.forecast_risk_level} />
              </div>
            </div>
          </section>
        )}

        {/* Infrastructure Section */}
        {infrastructure && (
          <section className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Infrastructure Risk</h2>

            <div className="flex flex-wrap gap-3">
              {infrastructure.high_risk_sectors.map((sector) => (
                <span
                  key={sector}
                  className="bg-secondary px-3 py-1 rounded-full text-sm"
                >
                  {sector}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}