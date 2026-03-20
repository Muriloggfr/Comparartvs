'use client';

import { TV } from '@/lib/types';

interface ReviewsPanelProps {
  tvs: TV[];
}

export default function ReviewsPanel({ tvs }: ReviewsPanelProps) {
  const tvsWithReviews = tvs.filter(tv => tv.reviews.length > 0);
  if (tvsWithReviews.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📋 Reviews & Avaliações</h2>
      {tvsWithReviews.map(tv => (
        <div key={tv.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">{tv.fullName}</h3>
            {tv.averageScore > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-3 rounded-full ${i < tv.averageScore ? 'bg-blue-500' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-blue-600">{tv.averageScore}/10</span>
                <span className="text-xs text-gray-400">({tv.reviews.length} fontes)</span>
              </div>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {tv.reviews.map((review, i) => (
              <div key={i} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-800">{review.source}</span>
                    {review.url && (
                      <a href={review.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline">↗</a>
                    )}
                  </div>
                  {review.score !== null && (
                    <div className={`px-2.5 py-1 rounded-full text-sm font-bold ${
                      review.score >= 8 ? 'bg-green-100 text-green-700' :
                      review.score >= 6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {review.score}/10
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{review.summary}</p>
                <div className="grid grid-cols-2 gap-3">
                  {review.pros.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-1">Prós</p>
                      <ul className="space-y-0.5">
                        {review.pros.map((pro, j) => (
                          <li key={j} className="text-xs text-gray-600">✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {review.cons.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-500 mb-1">Contras</p>
                      <ul className="space-y-0.5">
                        {review.cons.map((con, j) => (
                          <li key={j} className="text-xs text-gray-600">✗ {con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
