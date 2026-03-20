'use client';

import { TV } from '@/lib/types';

interface ComparisonTableProps {
  tvs: TV[];
}

const CHECK = '✓';
const CROSS = '✗';

function SpecRow({ label, values }: { label: string; values: (string | number | boolean | string[])[] }) {
  const format = (v: string | number | boolean | string[]) => {
    if (Array.isArray(v)) return v.length > 0 ? v.join(', ') : '—';
    if (typeof v === 'boolean') return v ? CHECK : CROSS;
    if (v === '' || v === 'N/A' || v === undefined) return '—';
    return String(v);
  };

  const allSame = values.every((v, _, arr) => format(v) === format(arr[0]));

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4 text-sm text-gray-500 font-medium w-40 whitespace-nowrap">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`py-3 px-4 text-sm text-center font-medium ${
          allSame ? 'text-gray-700' :
          format(v) === '—' ? 'text-gray-300' :
          'text-blue-700'
        }`}>
          {format(v)}
        </td>
      ))}
    </tr>
  );
}

export default function ComparisonTable({ tvs }: ComparisonTableProps) {
  if (tvs.length === 0) return null;

  const rows: { label: string; key: keyof TV['specs'] }[] = [
    { label: 'Tecnologia', key: 'screenTechnology' },
    { label: 'Resolução', key: 'resolution' },
    { label: 'Tamanho', key: 'screenSize' },
    { label: 'Taxa Refresh', key: 'refreshRate' },
    { label: 'HDR', key: 'hdr' },
    { label: 'Smart TV', key: 'smartTV' },
    { label: 'Processador', key: 'processor' },
    { label: 'HDMI', key: 'hdmiPorts' },
    { label: 'USB', key: 'usbPorts' },
    { label: 'Bluetooth', key: 'bluetooth' },
    { label: 'Wi-Fi', key: 'wifi' },
  ];

  const formatPrice = (price: number) =>
    price > 0 ? price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Consultar';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-4 px-4 text-left text-sm font-semibold text-gray-500 uppercase tracking-wide w-40">
                Especificação
              </th>
              {tvs.map((tv) => (
                <th key={tv.id} className="py-4 px-4 text-center min-w-36">
                  <div className="text-xs text-gray-400 font-medium uppercase">{tv.brand}</div>
                  <div className="text-sm font-bold text-gray-800 leading-tight">{tv.model}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price row */}
            <tr className="border-b border-gray-100 bg-green-50">
              <td className="py-3 px-4 text-sm text-gray-500 font-medium">Melhor Preço</td>
              {tvs.map((tv) => (
                <td key={tv.id} className="py-3 px-4 text-center">
                  <span className="text-sm font-bold text-green-700">{formatPrice(tv.bestPrice)}</span>
                </td>
              ))}
            </tr>

            {/* Review score row */}
            <tr className="border-b border-gray-100 bg-blue-50">
              <td className="py-3 px-4 text-sm text-gray-500 font-medium">Avaliação Média</td>
              {tvs.map((tv) => (
                <td key={tv.id} className="py-3 px-4 text-center">
                  {tv.averageScore > 0 ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-bold text-blue-700">{tv.averageScore}/10</span>
                      <div className="w-16 bg-blue-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${tv.averageScore * 10}%` }} />
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-300 text-sm">—</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Spec rows */}
            {rows.map((row) => (
              <SpecRow
                key={row.key}
                label={row.label}
                values={tvs.map((tv) => tv.specs[row.key] as string | number | boolean | string[])}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
