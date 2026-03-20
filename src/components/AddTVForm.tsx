'use client';

import { useState, useRef, useCallback } from 'react';
import { TV } from '@/lib/types';

interface AddTVFormProps {
  onTVAdded: (tv: TV) => void;
}

type InputMode = 'url' | 'model' | 'image';

export default function AddTVForm({ onTVAdded }: AddTVFormProps) {
  const [mode, setMode] = useState<InputMode>('url');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      // Extract base64 without the data URL prefix
      const base64 = result.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'image' && !imageBase64) {
      setError('Selecione uma imagem da TV ou da caixa.');
      return;
    }
    if (mode !== 'image' && !input.trim()) {
      setError(mode === 'url' ? 'Cole o link da TV.' : 'Digite o modelo da TV.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/tv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: input.trim(),
          inputType: mode,
          imageBase64: imageBase64 || undefined,
        }),
      });

      const data = await response.json();
      if (data.success && data.tv) {
        onTVAdded(data.tv);
        setInput('');
        setImagePreview(null);
        setImageBase64(null);
      } else {
        setError(data.error || 'Erro ao adicionar TV.');
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const modes: { key: InputMode; label: string; icon: string; placeholder: string }[] = [
    { key: 'url', label: 'Link da Loja', icon: '🔗', placeholder: 'Cole o link da Amazon, Kabum, Mercado Livre, Magalu...' },
    { key: 'model', label: 'Modelo', icon: '📝', placeholder: 'Ex: Samsung QN55Q80C, LG OLED55C3, Sony XR-55A80L' },
    { key: 'image', label: 'Foto da Caixa', icon: '📸', placeholder: '' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Adicionar TV</h2>

      {/* Mode selector */}
      <div className="flex gap-2 mb-5">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setError(''); }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              mode === m.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'image' ? (
          <div className="mb-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : imagePreview
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                  <p className="mt-2 text-sm text-green-600 font-medium">✓ Imagem selecionada — clique para trocar</p>
                </div>
              ) : (
                <div>
                  <div className="text-5xl mb-3">📷</div>
                  <p className="text-gray-600 font-medium">Arraste uma foto ou clique para selecionar</p>
                  <p className="text-gray-400 text-sm mt-1">Foto da caixa, etiqueta ou do modelo da TV</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); }}
            />
          </div>
        ) : (
          <div className="mb-4">
            <input
              type={mode === 'url' ? 'url' : 'text'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={modes.find(m => m.key === mode)?.placeholder}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Analisando TV...
            </>
          ) : (
            <>
              <span>+</span>
              Adicionar TV
            </>
          )}
        </button>
      </form>
    </div>
  );
}
