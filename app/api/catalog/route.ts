import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = getSupabaseAdmin();
    const [{ data: listings, error: listingsError }, { data: products, error: productsError }] = await Promise.all([
      db.from('motorcycle_listings').select('id,title,brand,model,version,model_year,mileage_km,price_brl,city,state,listing_url,image_url,condition,last_checked_at,sources(name)').eq('status', 'active').order('price_brl', { ascending: true, nullsFirst: false }).limit(200),
      db.from('product_listings').select('id,title,category,brand,price_brl,product_url,image_url,in_stock,last_checked_at,sources(name)').eq('status', 'active').order('price_brl', { ascending: true }).limit(200),
    ]);
    if (listingsError) throw listingsError;
    if (productsError) throw productsError;
    return NextResponse.json({ live: true, motorcycles: listings ?? [], products: products ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ live: false, motorcycles: [], products: [], message: error instanceof Error ? error.message : 'Catalog unavailable' }, { status: 503 });
  }
}
