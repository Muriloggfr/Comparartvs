import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { scrapeProductUrl } from '@/lib/scraper';
import {
  recognizeTVFromImage,
  extractTVSpecs,
  searchAndSummarizeReviews,
  calcAverageScore,
} from '@/lib/claude';
import { TV, TVPrice, AddTVRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: AddTVRequest = await request.json();
    const { input, inputType, imageBase64 } = body;

    if (!input && inputType !== 'image') {
      return NextResponse.json({ success: false, error: 'Input é obrigatório' }, { status: 400 });
    }

    let modelName: string | undefined;
    let productUrl: string | undefined;
    let scrapedData = null;

    // Step 1: Determine model from input type
    if (inputType === 'image' && imageBase64) {
      const mimeType = imageBase64.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
      modelName = await recognizeTVFromImage(imageBase64, mimeType);
      if (modelName === 'UNKNOWN') {
        return NextResponse.json({
          success: false,
          error: 'Não foi possível identificar o modelo da TV na imagem. Tente uma foto mais clara da etiqueta ou caixa.',
        }, { status: 400 });
      }
    } else if (inputType === 'url') {
      productUrl = input;
      // Scrape the URL
      scrapedData = await scrapeProductUrl(input);
      if (!scrapedData) {
        return NextResponse.json({
          success: false,
          error: 'Não foi possível acessar o link fornecido. Verifique se o link está correto.',
        }, { status: 400 });
      }
    } else {
      // Model name input
      modelName = input;
    }

    // Step 2: Extract structured specs using Claude
    const specsData = await extractTVSpecs(
      scrapedData || { name: modelName || '', description: '', specs: {}, store: '', url: productUrl || '', price: null, imageUrl: '' },
      modelName
    );

    // Step 3: Get reviews from Claude's knowledge
    const reviews = await searchAndSummarizeReviews(specsData.fullName, specsData.brand, specsData.model);

    // Step 4: Build price list
    const prices: TVPrice[] = [];
    if (scrapedData && scrapedData.price) {
      prices.push({
        store: scrapedData.store,
        price: scrapedData.price,
        url: scrapedData.url,
        available: true,
      });
    }

    const averageScore = calcAverageScore(reviews);
    const bestPrice = prices.length > 0 ? Math.min(...prices.map(p => p.price)) : 0;

    const tv: TV = {
      id: uuidv4(),
      inputType,
      originalInput: input || 'imagem',
      brand: specsData.brand,
      model: specsData.model,
      fullName: specsData.fullName,
      imageUrl: scrapedData?.imageUrl || '',
      specs: specsData.specs,
      prices,
      bestPrice,
      reviews,
      averageScore,
      rankingScore: 0,
      rankingPosition: 0,
      rankingJustification: '',
      addedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, tv });
  } catch (error) {
    console.error('Error adding TV:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno ao processar a TV. Tente novamente.',
    }, { status: 500 });
  }
}
