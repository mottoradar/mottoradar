-- Esquema inicial do MottoRadar para Supabase/PostgreSQL.
-- Execute no SQL Editor do seu projeto Supabase após revisar as políticas.
create extension if not exists pgcrypto;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  base_url text,
  access_type text not null default 'manual' check (access_type in ('api','feed','permitted_public_page','manual')),
  enabled boolean not null default false,
  terms_reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.motorcycle_listings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id),
  source_listing_id text,
  title text not null,
  brand text not null,
  model text not null,
  version text,
  model_year integer check (model_year between 1900 and 2100),
  mileage_km integer check (mileage_km >= 0),
  price_brl numeric(12,2) check (price_brl >= 0),
  city text,
  state char(2),
  listing_url text not null,
  status text not null default 'active' check (status in ('active','unavailable','stale')),
  source_published_at timestamptz,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, source_listing_id)
);

create index if not exists motorcycle_listings_search_idx on public.motorcycle_listings (brand, model, model_year);
create index if not exists motorcycle_listings_price_idx on public.motorcycle_listings (price_brl);
create index if not exists motorcycle_listings_location_idx on public.motorcycle_listings (state, city);
create index if not exists motorcycle_listings_status_checked_idx on public.motorcycle_listings (status, last_checked_at desc);

create table if not exists public.price_history (
  id bigint generated always as identity primary key,
  listing_id uuid not null references public.motorcycle_listings(id) on delete cascade,
  price_brl numeric(12,2) not null check (price_brl >= 0),
  observed_at timestamptz not null default now()
);
create index if not exists price_history_listing_date_idx on public.price_history (listing_id, observed_at desc);

-- Não habilite escrita pública. As coletas devem ocorrer no servidor com credenciais seguras.
alter table public.sources enable row level security;
alter table public.motorcycle_listings enable row level security;
alter table public.price_history enable row level security;

-- Leitura pública apenas de anúncios ativos; alterações devem passar pelo backend seguro.
create policy "Public can read active listings" on public.motorcycle_listings
  for select to anon, authenticated using (status = 'active');
create policy "Public can read sources" on public.sources
  for select to anon, authenticated using (enabled = true);
create policy "Public can read price history for active listings" on public.price_history
  for select to anon, authenticated using (
    exists (select 1 from public.motorcycle_listings m where m.id = listing_id and m.status = 'active')
  );

-- Extensões do catálogo e do integrador (pode ser executado após o esquema inicial).
alter table public.motorcycle_listings add column if not exists image_url text;
alter table public.motorcycle_listings add column if not exists condition text not null default 'unknown'
  check (condition in ('new','used','unknown'));

create table if not exists public.product_listings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id),
  source_product_id text,
  title text not null,
  category text not null,
  brand text,
  price_brl numeric(12,2) not null check (price_brl >= 0),
  product_url text not null,
  image_url text,
  in_stock boolean,
  status text not null default 'active' check (status in ('active','unavailable','stale')),
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, source_product_id)
);
create index if not exists product_listings_category_price_idx on public.product_listings (category, price_brl);
create index if not exists product_listings_status_checked_idx on public.product_listings (status, last_checked_at desc);

create table if not exists public.sync_runs (
  id bigint generated always as identity primary key,
  source_id uuid not null references public.sources(id),
  status text not null check (status in ('success','partial','failed')),
  listings_count integer not null default 0,
  products_count integer not null default 0,
  message text,
  started_at timestamptz not null default now()
);
create index if not exists sync_runs_source_date_idx on public.sync_runs (source_id, started_at desc);

alter table public.product_listings enable row level security;
alter table public.sync_runs enable row level security;

-- A API de ingestão usa a chave service role somente no servidor.
-- Não há política pública de escrita para anúncios, produtos ou histórico.
create policy "Public can read active product listings" on public.product_listings
  for select to anon, authenticated using (status = 'active');
