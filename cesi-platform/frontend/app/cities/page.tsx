'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { CityCard } from '@/components/city-card';
import {
  getCitiesRanking,
  getInvestmentPriority,
  RankingCity,
  InvestmentCity,
} from '@/lib/api';

export default function CitiesPage() {
  const [cities, setCities] = useState<RankingCity[]>([]);
  const [investmentCities, setInvestmentCities] = useState<InvestmentCity[]>([]);
  const [activeTab, setActiveTab] = useState<'risk' | 'investment'>('risk');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [riskData, investData] = await Promise.all([
          getCitiesRanking(),
          getInvestmentPriority(),
        ]);

        setCities(riskData);
        setInvestmentCities(investData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading cities:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Cities Overview
        </h1>

        <p className="text-muted-foreground mb-8">
          {activeTab === 'risk'
            ? 'Explore cities ranked by climate structural risk'
            : 'Discover cities requiring mitigation investment priority'}
        </p>

        {error && (
          <div className="mb-12 bg-red-100 border border-red-400 rounded-lg p-4 text-red-700">
            <p className="font-semibold">Error loading data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'risk'
                ? 'bg-primary text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            Risk Ranking
          </button>

          <button
            onClick={() => setActiveTab('investment')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'investment'
                ? 'bg-primary text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            Investment Priority
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'risk'
              ? cities.map((city) => (
                  <CityCard
                    key={city.city}
                    name={city.city}
                    score={city.cesi}
                    riskLevel={city.risk_level}
                    href={`/city/${encodeURIComponent(city.city)}`}
                  />
                ))
              : investmentCities.map((city) => (
                  <CityCard
                    key={city.city}
                    name={city.city}
                    score={city.investment_priority_score}
                    href={`/city/${encodeURIComponent(city.city)}`}
                  />
                ))}
          </div>
        )}
      </main>
    </div>
  );
}