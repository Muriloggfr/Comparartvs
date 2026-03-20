export interface TVSpecs {
  screenTechnology: string; // OLED, QLED, LED, Mini-LED, etc.
  resolution: string;       // 4K, 8K, Full HD, etc.
  screenSize: string;       // 55", 65", etc.
  refreshRate: string;      // 60Hz, 120Hz, etc.
  hdr: string[];            // HDR10, Dolby Vision, etc.
  smartTV: string;          // webOS, Tizen, Google TV, etc.
  processor: string;
  hdmiPorts: number;
  usbPorts: number;
  bluetooth: boolean;
  wifi: string;
  dimensions: string;
  weight: string;
  additionalFeatures: string[];
}

export interface TVReview {
  source: string;
  score: number | null;   // out of 10
  summary: string;
  pros: string[];
  cons: string[];
  url: string;
}

export interface TVPrice {
  store: string;
  price: number;
  url: string;
  available: boolean;
}

export interface TV {
  id: string;
  inputType: 'url' | 'model' | 'image';
  originalInput: string;
  brand: string;
  model: string;
  fullName: string;
  imageUrl: string;
  specs: TVSpecs;
  prices: TVPrice[];
  bestPrice: number;
  reviews: TVReview[];
  averageScore: number;
  rankingScore: number;   // composite score for ranking
  rankingPosition: number;
  rankingJustification: string;
  addedAt: string;
}

export interface ComparisonResult {
  tvs: TV[];
  ranking: RankingEntry[];
  analysis: string;
  recommendation: string;
  comparedAt: string;
}

export interface RankingEntry {
  position: number;
  tvId: string;
  tvName: string;
  score: number;
  highlights: string[];
  weaknesses: string[];
  verdict: string;
  bestFor: string;
}

export interface AddTVRequest {
  input: string;
  inputType: 'url' | 'model' | 'image';
  imageBase64?: string;
}

export interface AddTVResponse {
  success: boolean;
  tv?: TV;
  error?: string;
}
