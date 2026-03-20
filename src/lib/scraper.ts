import axios from 'axios';
import * as cheerio from 'cheerio';
import { TVPrice } from './types';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
};

async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      timeout: 15000,
      maxRedirects: 5,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return null;
  }
}

export function detectStore(url: string): string {
  if (url.includes('amazon.com.br') || url.includes('amzn.to')) return 'amazon';
  if (url.includes('mercadolivre.com.br') || url.includes('mercadolibre.com')) return 'mercadolivre';
  if (url.includes('kabum.com.br')) return 'kabum';
  if (url.includes('magazineluiza.com.br') || url.includes('magalu.com.br')) return 'magalu';
  return 'unknown';
}

export interface ScrapedProduct {
  name: string;
  price: number | null;
  imageUrl: string;
  description: string;
  specs: Record<string, string>;
  store: string;
  url: string;
}

async function scrapeAmazon(url: string): Promise<ScrapedProduct | null> {
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  const name = $('#productTitle').text().trim() ||
               $('h1.a-size-large').text().trim();

  const priceText = $('.a-price .a-offscreen').first().text().trim() ||
                    $('#price_inside_buybox').text().trim() ||
                    $('.a-price-whole').first().text().trim();
  const price = parsePrice(priceText);

  const imageUrl = $('#imgTagWrapperId img').attr('src') ||
                   $('#landingImage').attr('src') || '';

  const specs: Record<string, string> = {};
  $('table.a-normal tr, #productDetails_techSpec_section_1 tr').each((_, row) => {
    const key = $(row).find('td:first-child, th').text().trim();
    const value = $(row).find('td:last-child').text().trim();
    if (key && value) specs[key] = value;
  });

  const description = $('#feature-bullets .a-list-item').map((_, el) => $(el).text().trim()).get().join(' ');

  return { name, price, imageUrl, description, specs, store: 'Amazon Brasil', url };
}

async function scrapeMercadoLivre(url: string): Promise<ScrapedProduct | null> {
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  const name = $('h1.ui-pdp-title').text().trim() ||
               $('h1[class*="title"]').first().text().trim();

  const priceText = $('span.andes-money-amount__fraction').first().text().trim();
  const price = parsePrice(priceText.replace('.', '').replace(',', '.'));

  const imageUrl = $('img.ui-pdp-gallery__figure__image').first().attr('src') ||
                   $('figure img').first().attr('src') || '';

  const specs: Record<string, string> = {};
  $('table.andes-table tr, .ui-vip-specs__table tr').each((_, row) => {
    const key = $(row).find('th, td:first-child').text().trim();
    const value = $(row).find('td:last-child').text().trim();
    if (key && value && key !== value) specs[key] = value;
  });

  $('.ui-pdp-specs__item').each((_, item) => {
    const key = $(item).find('.ui-pdp-specs__item-title').text().trim();
    const value = $(item).find('.ui-pdp-specs__item-description').text().trim();
    if (key && value) specs[key] = value;
  });

  const description = $('.ui-pdp-description__content').text().trim();

  return { name, price, imageUrl, description, specs, store: 'Mercado Livre', url };
}

async function scrapeKabum(url: string): Promise<ScrapedProduct | null> {
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  const name = $('h1.sc-57e4c38a-6, h1[class*="ProductName"]').text().trim() ||
               $('h1').first().text().trim();

  const priceText = $('h4[class*="finalPrice"], span[class*="priceValue"]').first().text().trim();
  const price = parsePrice(priceText);

  const imageUrl = $('img[class*="productImage"]').first().attr('src') ||
                   $('figure img').first().attr('src') || '';

  const specs: Record<string, string> = {};
  $('table[class*="Specifications"] tr, .sc-specifications tr').each((_, row) => {
    const key = $(row).find('td:first-child').text().trim();
    const value = $(row).find('td:last-child').text().trim();
    if (key && value && key !== value) specs[key] = value;
  });

  const description = $('[class*="description"] p').map((_, el) => $(el).text().trim()).get().join(' ');

  return { name, price, imageUrl, description, specs, store: 'Kabum', url };
}

async function scrapeMagalu(url: string): Promise<ScrapedProduct | null> {
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  const name = $('h1[class*="header-product"]').text().trim() ||
               $('h1[data-testid="heading-product-title"]').text().trim() ||
               $('h1').first().text().trim();

  const priceText = $('[class*="price-template__price"], [data-testid="price-value"]').first().text().trim();
  const price = parsePrice(priceText);

  const imageUrl = $('img[data-testid="image-selected-thumbnail"]').attr('src') ||
                   $('[class*="product-media"] img').first().attr('src') || '';

  const specs: Record<string, string> = {};
  $('[data-testid="specification-table"] tr, table[class*="spec"] tr').each((_, row) => {
    const key = $(row).find('td:first-child, th').text().trim();
    const value = $(row).find('td:last-child').text().trim();
    if (key && value && key !== value) specs[key] = value;
  });

  const description = $('[class*="description__container"] p').map((_, el) => $(el).text().trim()).get().join(' ');

  return { name, price, imageUrl, description, specs, store: 'Magazine Luiza', url };
}

async function scrapeGeneric(url: string): Promise<ScrapedProduct | null> {
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  // Try common patterns
  const name = $('h1').first().text().trim();

  // Look for price-like content
  let priceText = '';
  $('[class*="price"], [id*="price"], [class*="valor"]').each((_, el) => {
    const text = $(el).text().trim();
    if (/R\$|[\d]{3,}/.test(text) && text.length < 50) {
      priceText = text;
      return false; // break
    }
  });
  const price = parsePrice(priceText);

  const imageUrl = $('meta[property="og:image"]').attr('content') ||
                   $('img[class*="product"]').first().attr('src') || '';

  // Try to extract specs from tables
  const specs: Record<string, string> = {};
  $('table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      const key = $(cells[0]).text().trim();
      const value = $(cells[1]).text().trim();
      if (key && value && key.length < 100) specs[key] = value;
    }
  });

  const description = $('meta[name="description"]').attr('content') ||
                      $('[class*="description"]').first().text().trim().slice(0, 500);

  return { name, price, imageUrl, description, specs, store: 'Loja Online', url };
}

export async function scrapeProductUrl(url: string): Promise<ScrapedProduct | null> {
  const store = detectStore(url);

  switch (store) {
    case 'amazon': return scrapeAmazon(url);
    case 'mercadolivre': return scrapeMercadoLivre(url);
    case 'kabum': return scrapeKabum(url);
    case 'magalu': return scrapeMagalu(url);
    default: return scrapeGeneric(url);
  }
}

export async function searchPricesForModel(model: string): Promise<TVPrice[]> {
  const prices: TVPrice[] = [];

  // Search on Kabum
  try {
    const kabumSearchUrl = `https://www.kabum.com.br/busca/${encodeURIComponent(model)}`;
    const html = await fetchPage(kabumSearchUrl);
    if (html) {
      const $ = cheerio.load(html);
      const firstResult = $('a[class*="productLink"]').first();
      const productUrl = 'https://www.kabum.com.br' + firstResult.attr('href');
      const priceText = firstResult.find('[class*="priceCard"], [class*="price"]').first().text().trim();
      const price = parsePrice(priceText);
      if (price && productUrl.length > 30) {
        prices.push({ store: 'Kabum', price, url: productUrl, available: true });
      }
    }
  } catch { /* skip */ }

  return prices;
}

function parsePrice(text: string): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^\d,]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}
