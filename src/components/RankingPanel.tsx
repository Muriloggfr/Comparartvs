'use client';

import { ComparisonResult } from '@/lib/types';

interface RankingPanelProps {
  result: ComparisonResult;
}

const MEDAL = ['🥇', '🥈', '🥉'];
const POSITION_COLORS = [
  'border-yellow-400 bg-yellow-50',
  'border-gray-300 bg-gray-50',
  'border-amber-500 bg-amber-50',
];

export default function RankingPanel({ result }: RankingPanelProps) {
  return (
    <div className="space-y-6">
      {/* Ranking cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">🏆 Ranking Final</h2>
        {result.ranking.map((entry, i) => (
          <div
            key={entry.tvId}
            className={`rounded-2xl border-2 p-5 ${POSITION_COLORS[i] || 'border-gray-100 bg-white'}`}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">{MEDAL[i] || `#${entry.position}`}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{entry.tvName}</h3>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-2xl font-black text-blue-700">{entry.score.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">/10</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-3 italic">{entry.bestFor}</p>

                <p className="text-sm text-gray-700 mb-3">{entry.verdict}</p>

                <div className="grid grid-cols-2 gap-3">
                  {entry.highlights.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-1">✓ Pontos fortes</p>
                      <ul className="space-y-0.5">
                        {entry.highlights.map((h, j) => (
                          <li key={j} className="text-xs text-gray-600">• {h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {entry.weaknesses.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-600 mb-1">✗ Pontos fracos</p>
                      <ul className="space-y-0.5">
                        {entry.weaknesses.map((w, j) => (
                          <li key={j} className="text-xs text-gray-600">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analysis */}
      {result.analysis && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Análise Detalhada</h3>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{result.analysis}</div>
        </div>
      )}

      {/* Recommendation */}
      {result.recommendation && (
        <div className="bg-blue-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-3">💡 Recomendação Final</h3>
          <p className="text-sm leading-relaxed opacity-90">{result.recommendation}</p>
        </div>
      )}
    </div>
  );
}
