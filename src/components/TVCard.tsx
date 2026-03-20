'use client';

import { TV } from '@/lib/types';

interface TVCardProps {
  tv: TV;
  onRemove: (id: string) => void;
  rankingPosition?: number;
  score?: number;
}

const TECH_COLORS: Record<string, string> = {
  OLED: 'bg-purple-100 text-purple-700',
  'OLED evo': 'bg-purple-100 text-purple-700',
  QLED: 'bg-blue-100 text-blue-700',
  'Neo QLED': 'bg-blue-100 text-blue-700',
  'Mini-LED': 'bg-cyan-100 text-cyan-700',
  LED: 'bg-gray-100 text-gray-700',
  WOLED: 'bg-pink-100 text-pink-700',
};

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function TVCard({ tv, onRemove, rankingPosition, score }: TVCardProps) {
  const techColor = TECH_COLORS[tv.specs.screenTechnology] || 'bg-gray-100 text-gray-700';

  const formatPrice = (price: number) =>
    price > 0 ? price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Consultar';

  return (
    <div className={`bg-white rounded-2xl shadow-md border-2 transition-all duration-300 overflow-hidden ${
      rankingPosition === 1 ? 'border-yellow-400' :
      rankingPosition === 2 ? 'border-gray-300' :
      rankingPosition === 3 ? 'border-amber-500' :
      'border-gray-100'
    }`}>
      {/* Ranking badge */}
      {rankingPosition && (
        <div className={`px-4 py-2 text-sm font-bold flex items-center gap-2 ${
          rankingPosition === 1 ? 'bg-yellow-50 text-yellow-700' :
          rankingPosition === 2 ? 'bg-gray-50 text-gray-600' :
          rankingPosition === 3 ? 'bg-amber-50 text-amber-700' :
          'bg-gray-50 text-gray-500'
        }`}>
          <span className="text-lg">{MEDAL[rankingPosition] || `#${rankingPosition}`}</span>
          <span>#{rankingPosition} no ranking</span>
          {score !== undefined && (
            <span className="ml-auto text-base font-bold">{score.toFixed(1)}/10</span>
          )}
        </div>
      )}

      {/* Image */}
      <div className="bg-gray-50 h-40 flex items-center justify-center relative">
        {tv.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tv.imageUrl} alt={tv.fullName} className="h-full w-full object-contain p-4" />
        ) : (
          <div className="text-6xl">📺</div>
        )}
        <button
          onClick={() => onRemove(tv.id)}
          className="absolute top-2 right-2 w-7 h-7 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center text-sm transition-colors"
          title="Remover TV"
        >
          ×
        </button>
      </div>

      <div className="p-4">
        {/* Name & Brand */}
        <div className="mb-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{tv.brand}</p>
          <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{tv.fullName}</h3>
        </div>

        {/* Tech badge + Resolution */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${techColor}`}>
            {tv.specs.screenTechnology}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
            {tv.specs.resolution}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
            {tv.specs.screenSize}
          </span>
        </div>

        {/* Key specs */}
        <div className="space-y-1 text-xs text-gray-600 mb-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Taxa de Atualização</span>
            <span className="font-medium">{tv.specs.refreshRate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Smart TV</span>
            <span className="font-medium">{tv.specs.smartTV}</span>
          </div>
          {tv.specs.hdr.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">HDR</span>
              <span className="font-medium">{tv.specs.hdr.slice(0, 2).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {tv.bestPrice > 0 && (
          <div className="mb-3 p-2.5 bg-green-50 rounded-xl">
            <p className="text-xs text-green-600 font-medium">Melhor Preço</p>
            <p className="text-lg font-bold text-green-700">{formatPrice(tv.bestPrice)}</p>
            {tv.prices[0] && (
              <a href={tv.prices[0].url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline">{tv.prices[0].store}</a>
            )}
          </div>
        )}

        {/* Review score */}
        {tv.averageScore > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${tv.averageScore * 10}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-600">{tv.averageScore}/10</span>
          </div>
        )}
      </div>
    </div>
  );
}
