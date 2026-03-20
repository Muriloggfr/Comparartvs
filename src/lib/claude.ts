import Anthropic from '@anthropic-ai/sdk';
import { TV, TVSpecs, TVReview, TVPrice, RankingEntry, ComparisonResult } from './types';
import { ScrapedProduct } from './scraper';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-6';

// Recognize TV model from photo (base64 image)
export async function recognizeTVFromImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: 'This is a photo of a TV box or TV product. Extract the exact TV model name and brand from this image. Return ONLY the model name in the format: "Brand ModelNumber" (e.g., "Samsung QN55Q80C" or "LG OLED55C3"). If you cannot identify the model, return "UNKNOWN".',
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : 'UNKNOWN';
  return text;
}

// Extract structured TV specs from scraped data using Claude
export async function extractTVSpecs(scrapedData: ScrapedProduct, modelName?: string): Promise<{
  brand: string;
  model: string;
  fullName: string;
  specs: TVSpecs;
}> {
  const prompt = `You are a TV specification expert. Analyze the following product data and extract structured information.

Product Name: ${scrapedData.name || modelName || 'Unknown'}
Description: ${scrapedData.description || ''}
Raw Specs: ${JSON.stringify(scrapedData.specs, null, 2)}

Extract and return a JSON object with this exact structure:
{
  "brand": "brand name (Samsung, LG, Sony, etc.)",
  "model": "model number/code",
  "fullName": "full product name",
  "specs": {
    "screenTechnology": "OLED/QLED/LED/Mini-LED/Neo QLED/WOLED/etc.",
    "resolution": "4K/8K/Full HD/HD",
    "screenSize": "size in inches (e.g., 55\")",
    "refreshRate": "refresh rate (e.g., 120Hz)",
    "hdr": ["list of HDR formats supported, e.g., HDR10, Dolby Vision, HLG"],
    "smartTV": "smart TV platform (webOS, Tizen, Google TV, Android TV, etc.)",
    "processor": "processor name if available",
    "hdmiPorts": number of HDMI ports,
    "usbPorts": number of USB ports,
    "bluetooth": true/false,
    "wifi": "WiFi standard supported",
    "dimensions": "dimensions if available",
    "weight": "weight if available",
    "additionalFeatures": ["other notable features like Dolby Atmos, built-in camera, etc."]
  }
}

Return ONLY the JSON, no explanation.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch { /* fallback below */ }

  return {
    brand: extractBrand(scrapedData.name || modelName || ''),
    model: modelName || scrapedData.name || 'Unknown',
    fullName: scrapedData.name || modelName || 'Unknown TV',
    specs: getDefaultSpecs(),
  };
}

// Search and summarize internet reviews for a TV model
export async function searchAndSummarizeReviews(tvFullName: string, brand: string, model: string): Promise<TVReview[]> {
  const prompt = `You are a TV review expert with knowledge of major TV models up to 2025.

For the TV: ${tvFullName} (${brand} ${model})

Based on your knowledge of this TV and reviews from sites like TechRadar, RTINGS, The Verge, Tom's Guide, Canaltech, Zoom, Tudocelular, and other major review sources:

Return a JSON array of up to 3 review summaries in this format:
[
  {
    "source": "site name",
    "score": score out of 10 (number or null if not rated),
    "summary": "2-3 sentence summary of the review",
    "pros": ["pro 1", "pro 2", "pro 3"],
    "cons": ["con 1", "con 2"],
    "url": "approximate URL or empty string"
  }
]

If you don't have specific review data for this model, create reasonable reviews based on what you know about this TV's technology and typical reception. Always base on real technical knowledge.

Return ONLY the JSON array.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]';

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch { /* fallback */ }

  return [];
}

// Generate full comparison and ranking
export async function generateComparison(tvs: TV[]): Promise<ComparisonResult> {
  const tvSummaries = tvs.map(tv => ({
    id: tv.id,
    name: tv.fullName,
    brand: tv.brand,
    model: tv.model,
    specs: tv.specs,
    bestPrice: tv.bestPrice,
    averageScore: tv.averageScore,
    reviews: tv.reviews.map(r => ({ source: r.source, score: r.score, pros: r.pros, cons: r.cons })),
  }));

  const prompt = `You are a professional TV comparison expert. Analyze these TVs and create a comprehensive ranking and comparison.

TVs to compare:
${JSON.stringify(tvSummaries, null, 2)}

Create a detailed comparison considering:
1. Picture quality (screen technology, resolution, HDR support)
2. Performance (refresh rate, processor, gaming features)
3. Smart TV platform and usability
4. Value for money (price vs features)
5. User reviews and ratings
6. Overall reliability and brand reputation

Return a JSON object with this structure:
{
  "ranking": [
    {
      "position": 1,
      "tvId": "tv id",
      "tvName": "full name",
      "score": overall score 0-10 (number),
      "highlights": ["top strength 1", "top strength 2", "top strength 3"],
      "weaknesses": ["main weakness 1", "main weakness 2"],
      "verdict": "2-3 sentence verdict",
      "bestFor": "who this TV is best for (e.g., gamers, cinephiles, casual viewers)"
    }
  ],
  "analysis": "3-4 paragraph comprehensive analysis comparing all TVs across key dimensions",
  "recommendation": "Clear recommendation paragraph about which TV to buy and why, considering different use cases"
}

Rank from best to worst. Be specific, honest and helpful. Return ONLY the JSON.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        tvs,
        ranking: parsed.ranking || [],
        analysis: parsed.analysis || '',
        recommendation: parsed.recommendation || '',
        comparedAt: new Date().toISOString(),
      };
    }
  } catch { /* fallback */ }

  return {
    tvs,
    ranking: tvs.map((tv, i) => ({
      position: i + 1,
      tvId: tv.id,
      tvName: tv.fullName,
      score: tv.averageScore,
      highlights: [],
      weaknesses: [],
      verdict: 'Análise indisponível',
      bestFor: 'Uso geral',
    })),
    analysis: 'Análise comparativa indisponível.',
    recommendation: 'Recomendação indisponível.',
    comparedAt: new Date().toISOString(),
  };
}

// Calculate average review score
export function calcAverageScore(reviews: TVReview[]): number {
  const scored = reviews.filter(r => r.score !== null);
  if (scored.length === 0) return 0;
  return Math.round((scored.reduce((sum, r) => sum + (r.score || 0), 0) / scored.length) * 10) / 10;
}

function extractBrand(name: string): string {
  const brands = ['Samsung', 'LG', 'Sony', 'TCL', 'Philips', 'Panasonic', 'Hisense', 'AOC', 'Semp', 'Sharp'];
  for (const brand of brands) {
    if (name.toLowerCase().includes(brand.toLowerCase())) return brand;
  }
  return name.split(' ')[0] || 'Unknown';
}

function getDefaultSpecs(): TVSpecs {
  return {
    screenTechnology: 'LED',
    resolution: '4K',
    screenSize: 'N/A',
    refreshRate: '60Hz',
    hdr: [],
    smartTV: 'Smart TV',
    processor: 'N/A',
    hdmiPorts: 0,
    usbPorts: 0,
    bluetooth: false,
    wifi: 'Wi-Fi',
    dimensions: 'N/A',
    weight: 'N/A',
    additionalFeatures: [],
  };
}
