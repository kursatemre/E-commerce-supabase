-- Variant system schema (maps to required varyant_tipleri / varyant_secenekleri / urun_varyantlari structure)

create table if not exists public.variant_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.variant_options (
  id uuid primary key default gen_random_uuid(),
  variant_type_id uuid not null references public.variant_types(id) on delete cascade,
  value text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (variant_type_id, value)
);

-- Which variant types are enabled for a given product
create table if not exists public.product_variant_types (
  product_id uuid not null references public.products(id) on delete cascade,
  variant_type_id uuid not null references public.variant_types(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (product_id, variant_type_id)
);

create table if not exists public.product_variant_options (
  product_id uuid not null references public.products(id) on delete cascade,
  variant_option_id uuid not null references public.variant_options(id) on delete cascade,
  primary key (product_id, variant_option_id)
);

-- Extend product_variants (acts as urun_varyantlari)
alter table public.product_variants
  add column if not exists sku text,
  add column if not exists image_id uuid references public.product_images(id) on delete set null,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

create unique index if not exists product_variants_sku_unique on public.product_variants (sku) where sku is not null;

-- Pivot: each SKU -> selected options
create table if not exists public.variant_option_product_variants (
  product_variant_id uuid not null references public.product_variants(id) on delete cascade,
  variant_option_id uuid not null references public.variant_options(id) on delete cascade,
  primary key (product_variant_id, variant_option_id)
);

-- Helpful view so Supabase Studio shows Turkish names if desired
create or replace view public.varyant_tipleri as
  select id, code as benzersiz_kod, name as gorunen_isim, description, is_active, sort_order
  from public.variant_types;

create or replace view public.varyant_secenekleri as
  select vo.id,
         vo.variant_type_id,
         vt.name as tip_adi,
         vo.value as deger,
         vo.sort_order,
         vo.is_active
  from public.variant_options vo
  join public.variant_types vt on vt.id = vo.variant_type_id;

create or replace view public.urun_varyantlari as
  select pv.*
  from public.product_variants pv;
