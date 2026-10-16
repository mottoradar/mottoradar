import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type IncomingListing = {
  externalId?: string;
  title: string;
  brand?: string;
  model?: string;
  version?: string;
  year?: number;
  mileageKm?: number;
  priceBrl?: number;
  city?: string;
  state?: string;
  url: string;
  publishedAt?: string;
  imageUrl?: string;
  condition?: 'new' | 'used' | 'unknown';
};
type IncomingProduct = {
  externalId?: string;
  title: string;
  category: string;
  brand?: string;
  priceBrl: number;
  url: string;
  imageUrl?: string;
  inStock?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isValidUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try { const parsed = new URL(value); return parsed.protocol === 'https:' || parsed.protocol === 'http:'; }
  catch { return false; }
}
function validListing(value: unknown): value is IncomingListing {
  if (!isRecord(value)) return false;
  return typeof value.title === 'string' && value.title.trim().length > 0 &&
    isValidUrl(value.url) && (value.priceBrl === undefined || (typeof value.priceBrl === 'number' && value.priceBrl >= 0)) &&
    (value.year === undefined || (Number.isInteger(value.year) && Number(value.year) >= 1900 && Number(value.year) <= 2100)) &&
    (value.mileageKm === undefined || (Number.isInteger(value.mileageKm) && Number(value.mileageKm) >= 0));
}
function validProduct(value: unknown): value is IncomingProduct {
  return isRecord(value) && typeof value.title === 'string' && value.title.trim().length > 0 &&
    typeof value.category === 'string' && value.category.trim().length > 0 &&
    typeof value.priceBrl === 'number' && Number.isFinite(value.priceBrl) && value.priceBrl >= 0 && isValidUrl(value.url);
}

/**
 * Protected normalized-data ingestion endpoint. Source-specific adapters should fetch data
 * according to each provider's API/feed terms, normalize it, then POST here.
 */
export async function POST(request: NextRequest) {
  const expectedSecret = process.env.INGEST_SECRET;
  const providedSecret = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (!isRecord(body) || typeof body.sourceName !== 'string' || !body.sourceName.trim()) {
    return NextResponse.json({ error: 'sourceName is required' }, { status: 400 });
  }
  const listings = body.listings === undefined ? [] : body.listings;
  const products = body.products === undefined ? [] : body.products;
  if (!Array.isArray(listings) || !listings.every(validListing) || !Array.isArray(products) || !products.every(validProduct)) {
    return NextResponse.json({ error: 'One or more listing/product records are invalid' }, { status: 400 });
  }
  if (listings.length + products.length > 500) {
    return NextResponse.json({ error: 'Maximum 500 records per request' }, { status: 413 });
  }

  const db = getSupabaseAdmin();
  const sourceName = body.sourceName.trim().slice(0, 120);
  const sourceUrl = isValidUrl(body.sourceUrl) ? body.sourceUrl : null;
  const { data: source, error: sourceError } = await db.from('sources')
    .upsert({ name: sourceName, base_url: sourceUrl, access_type: 'api', enabled: true }, { onConflict: 'name' })
    .select('id').single();
  if (sourceError || !source) return NextResponse.json({ error: 'Could not register source', detail: sourceError?.message }, { status: 500 });

  let insertedListings = 0;
  let insertedProducts = 0;
  if (listings.length) {
    const rows = (listings as IncomingListing[]).map((item) => ({
      source_id: source.id, source_listing_id: item.externalId ?? item.url,
      title: item.title.trim().slice(0, 300), brand: item.brand?.trim().slice(0, 100) || 'Não informado',
      model: item.model?.trim().slice(0, 150) || item.title.trim().slice(0, 150), version: item.version ?? null,
      model_year: item.year ?? null, mileage_km: item.mileageKm ?? null, price_brl: item.priceBrl ?? null,
      city: item.city ?? null, state: item.state?.toUpperCase().slice(0, 2) ?? null,
      listing_url: item.url, source_published_at: item.publishedAt ?? null,
      image_url: item.imageUrl && isValidUrl(item.imageUrl) ? item.imageUrl : null,
      condition: item.condition ?? 'unknown', status: 'active', last_checked_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }));
    const { error } = await db.from('motorcycle_listings').upsert(rows, { onConflict: 'source_id,source_listing_id' });
    if (error) return NextResponse.json({ error: 'Could not import motorcycle listings', detail: error.message }, { status: 500 });
    const pricedIds = rows.filter((row) => row.price_brl !== null).map((row) => row.source_listing_id);
    if (pricedIds.length) {
      const { data: stored, error: storedError } = await db.from('motorcycle_listings')
        .select('id,price_brl').eq('source_id', source.id).in('source_listing_id', pricedIds);
      if (storedError) return NextResponse.json({ error: 'Listings imported but price history could not be read', detail: storedError.message }, { status: 500 });
      const history = (stored ?? []).filter((row) => row.price_brl !== null).map((row) => ({ listing_id: row.id, price_brl: row.price_brl }));
      if (history.length) {
        const { error: historyError } = await db.from('price_history').insert(history);
        if (historyError) return NextResponse.json({ error: 'Listings imported but price history could not be saved', detail: historyError.message }, { status: 500 });
      }
    }
    insertedListings = rows.length;
  }
  if (products.length) {
    const rows = (products as IncomingProduct[]).map((item) => ({
      source_id: source.id, source_product_id: item.externalId ?? item.url,
      title: item.title.trim().slice(0, 300), category: item.category.trim().slice(0, 100),
      brand: item.brand?.trim().slice(0, 100) ?? null, price_brl: item.priceBrl,
      product_url: item.url, image_url: item.imageUrl && isValidUrl(item.imageUrl) ? item.imageUrl : null,
      in_stock: item.inStock ?? null, status: 'active', last_checked_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }));
    const { error } = await db.from('product_listings').upsert(rows, { onConflict: 'source_id,source_product_id' });
    if (error) return NextResponse.json({ error: 'Could not import products', detail: error.message }, { status: 500 });
    insertedProducts = rows.length;
  }
  await db.from('sync_runs').insert({ source_id: source.id, status: 'success', listings_count: insertedListings, products_count: insertedProducts });
  return NextResponse.json({ ok: true, source: sourceName, imported: { listings: insertedListings, products: insertedProducts } });
}
