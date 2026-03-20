'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AddTVForm from '@/components/AddTVForm';
import TVCard from '@/components/TVCard';
import { TV } from '@/lib/types';

const STORAGE_KEY = 'comparartvs_list';

function loadTVs(): TV[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveTVs(tvs: TV[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tvs));
  }
}

export default function Home() {
  const [tvs, setTVs] = useState<TV[]>(() => loadTVs());
  const [comparing, setComparing] = useState(false);
  const router = useRouter();

  const handleTVAdded = useCallback((tv: TV) => {
    setTVs(prev => {
      const updated = [...prev, tv];
      saveTVs(updated);
      return updated;
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setTVs(prev => {
      const updated = prev.filter(tv => tv.id !== id);
      saveTVs(updated);
      return updated;
    });
  }, []);

  const handleClear = () => {
    setTVs([]);
    saveTVs([]);
  };

  const handleCompare = async () => {
    if (tvs.length < 2) return;
    setComparing(true);
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tvs }),
      });
      const data = await response.json();
      if (data.success && data.result) {
        sessionStorage.setItem('comparartvs_result', JSON.stringify(data.result));
        router.push('/compare');
      } else {
        alert(data.error || 'Erro ao gerar comparação.');
      }
    } catch {
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setComparing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📺</span>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">CompararTVs</h1>
              <p className="text-xs text-blue-300">Compare e encontre a melhor TV</p>
            </div>
          </div>
          {tvs.length > 0 && (
            <button
              onClick={handleClear}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Limpar lista
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-5">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Adicione suas TVs</h2>
                <p className="text-blue-300 text-sm">
                  Cole um link, digite o modelo ou tire uma foto da caixa
                </p>
              </div>

              <AddTVForm onTVAdded={handleTVAdded} />

              {/* How-to */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white text-sm font-semibold mb-2">Como funciona</h3>
                <div className="space-y-2 text-xs text-blue-200">
                  <div className="flex gap-2"><span>1.</span><span>Adicione 2 ou mais TVs por link, modelo ou foto da caixa</span></div>
                  <div className="flex gap-2"><span>2.</span><span>A IA analisa specs, preços e reviews de cada TV</span></div>
                  <div className="flex gap-2"><span>3.</span><span>Gere o comparativo com ranking inteligente</span></div>
                </div>
              </div>

              {/* Compare button */}
              {tvs.length >= 2 && (
                <button
                  onClick={handleCompare}
                  disabled={comparing}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-900/50 transition-all duration-200 flex items-center justify-center gap-2 text-lg"
                >
                  {comparing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Gerando comparativo...
                    </>
                  ) : (
                    <>🏆 Comparar {tvs.length} TVs</>
                  )}
                </button>
              )}

              {tvs.length === 1 && (
                <div className="text-center text-blue-300 text-sm">
                  Adicione mais 1 TV para comparar
                </div>
              )}
            </div>
          </div>

          {/* Right column - TV list */}
          <div className="lg:col-span-2">
            {tvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-8xl mb-4 opacity-30">📺</div>
                <h3 className="text-white/50 text-xl font-bold mb-2">Nenhuma TV adicionada</h3>
                <p className="text-blue-300/50 text-sm max-w-xs">
                  Adicione TVs pela barra lateral usando link da loja, modelo ou foto da caixa
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold text-lg">
                    {tvs.length} TV{tvs.length > 1 ? 's' : ''} adicionada{tvs.length > 1 ? 's' : ''}
                  </h2>
                  <span className="text-blue-300 text-sm">Máximo 6 TVs</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tvs.map(tv => (
                    <TVCard key={tv.id} tv={tv} onRemove={handleRemove} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
