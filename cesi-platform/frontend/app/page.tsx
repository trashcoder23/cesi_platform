'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { CityCard } from '@/components/city-card';
import { ImportanceChart } from '@/components/importance-chart';
import {
  getCitiesRanking,
  getModelImportance,
  RankingCity,
  ModelImportance,
} from '@/lib/api';

export default function Home() {
  const [topCities, setTopCities] = useState<RankingCity[]>([]);
  const [importance, setImportance] = useState<ModelImportance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [cities, modelData] = await Promise.all([
          getCitiesRanking(),
          getModelImportance(),
        ]);

        // Top 6 highest risk (lowest CESI first if sorted that way)
        setTopCities(cities.slice(0, 6));
        setImportance(modelData);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">

        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Global Climate Risk Dashboard
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Explore structural climate stress, infrastructure risk, and mitigation
            priorities across major global cities.
          </p>

          <Link href="/cities">
            <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              Explore All Cities
            </button>
          </Link>
        </div>

        {error && (
          <div className="mb-12 bg-red-100 border border-red-400 rounded-lg p-4 text-red-700">
            <p className="font-semibold">Error loading data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Top Risk Cities */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8">
                Highest Risk Cities
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topCities.map((city) => (
                  <CityCard
                    key={city.city}
                    name={city.city}
                    score={city.cesi}
                    riskLevel={city.risk_level}
                    href={`/city/${encodeURIComponent(city.city)}`}
                  />
                ))}
              </div>
            </section>

            {/* Model Importance */}
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
  );
}