'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ComparisonResult } from '@/lib/types';
import TVCard from '@/components/TVCard';
import ComparisonTable from '@/components/ComparisonTable';
import RankingPanel from '@/components/RankingPanel';
import ReviewsPanel from '@/components/ReviewsPanel';

type Tab = 'ranking' | 'table' | 'reviews';

export default function ComparePage() {
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('ranking');
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem('comparartvs_result');
    if (data) {
      setResult(JSON.parse(data));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-5xl mb-4 animate-pulse">📺</div>
          <p>Carregando comparativo...</p>
        </div>
      </div>
    );
  }

  const rankingMap = new Map(result.ranking.map(r => [r.tvId, r]));

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'ranking', label: 'Ranking', icon: '🏆' },
    { key: 'table', label: 'Comparativo', icon: '📊' },
    { key: 'reviews', label: 'Reviews', icon: '📋' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-2xl">📺</span>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">CompararTVs</h1>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm text-blue-300 hover:text-white transition-colors border border-blue-400/30 hover:border-blue-400 px-3 py-1.5 rounded-lg"
          >
            ← Nova comparação
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* TV cards row */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4">TVs Comparadas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {result.tvs.map(tv => {
              const rank = rankingMap.get(tv.id);
              return (
                <TVCard
                  key={tv.id}
                  tv={tv}
                  onRemove={() => {}}
                  rankingPosition={rank?.position}
                  score={rank?.score}
                />
              );
            })}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 border-b border-white/10 pb-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pb-12">
          {activeTab === 'ranking' && <RankingPanel result={result} />}
          {activeTab === 'table' && <ComparisonTable tvs={result.tvs} />}
          {activeTab === 'reviews' && <ReviewsPanel tvs={result.tvs} />}
        </div>
      </div>
    </main>
  );
}
