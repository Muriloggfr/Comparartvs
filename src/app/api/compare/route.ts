import { NextRequest, NextResponse } from 'next/server';
import { generateComparison } from '@/lib/claude';
import { TV } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: { tvs: TV[] } = await request.json();
    const { tvs } = body;

    if (!tvs || tvs.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Adicione pelo menos 2 TVs para comparar.',
      }, { status: 400 });
    }

    if (tvs.length > 6) {
      return NextResponse.json({
        success: false,
        error: 'Máximo de 6 TVs por comparação.',
      }, { status: 400 });
    }

    const result = await generateComparison(tvs);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error comparing TVs:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao gerar comparação. Tente novamente.',
    }, { status: 500 });
  }
}
