-- Trendyol marketplace sync schema

create table if not exists public.trendyol_products (
  id uuid primary key default gen_random_uuid(),
  marketplace_product_id text not null,
  product_id uuid references public.products(id) on delete set null,
  sku text,
  barcode text,
  title text,
  currency text not null default 'TRY',
  price numeric(12,2),
  discounted_price numeric(12,2),
  stock integer,
  status text not null default 'passive',
  last_synced_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists trendyol_products_marketplace_product_id_idx on public.trendyol_products(marketplace_product_id);
create index if not exists trendyol_products_product_id_idx on public.trendyol_products(product_id);
create index if not exists trendyol_products_sku_idx on public.trendyol_products(sku);

create or replace function public.set_trendyol_products_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_trendyol_products_updated_at on public.trendyol_products;
create trigger set_trendyol_products_updated_at
before update on public.trendyol_products
for each row execute procedure public.set_trendyol_products_updated_at();

create table if not exists public.trendyol_sync_runs (
  id uuid primary key default gen_random_uuid(),
  sync_type text not null,
  started_at timestamptz not null default timezone('utc', now()),
  finished_at timestamptz,
  status text not null default 'running',
  processed_count integer not null default 0,
  error_count integer not null default 0,
  error_message text,
  metadata jsonb
);

create index if not exists trendyol_sync_runs_type_idx on public.trendyol_sync_runs(sync_type);
create index if not exists trendyol_sync_runs_started_at_idx on public.trendyol_sync_runs(started_at);

create table if not exists public.trendyol_orders (
  id uuid primary key default gen_random_uuid(),
  marketplace_order_id text not null,
  order_number text,
  marketplace_status text not null default 'created',
  order_date timestamptz,
  shipment_package_id text,
  buyer_name text,
  buyer_email text,
  total_price numeric(12,2),
  currency text not null default 'TRY',
  shipping_address jsonb,
  billing_address jsonb,
  raw_payload jsonb,
  mapped_order_id uuid references public.orders(id) on delete set null,
  last_status_synced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists trendyol_orders_marketplace_order_id_idx on public.trendyol_orders(marketplace_order_id);
create index if not exists trendyol_orders_mapped_order_id_idx on public.trendyol_orders(mapped_order_id);

create or replace function public.set_trendyol_orders_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_trendyol_orders_updated_at on public.trendyol_orders;
create trigger set_trendyol_orders_updated_at
before update on public.trendyol_orders
for each row execute procedure public.set_trendyol_orders_updated_at();

create table if not exists public.trendyol_order_items (
  id uuid primary key default gen_random_uuid(),
  trendyol_order_id uuid not null references public.trendyol_orders(id) on delete cascade,
  marketplace_order_item_id text,
  trendyol_product_id text,
  product_id uuid references public.products(id) on delete set null,
  sku text,
  quantity integer not null default 1,
  unit_price numeric(12,2),
  vat_rate numeric(5,2),
  discount numeric(12,2),
  status text,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists trendyol_order_items_order_id_idx on public.trendyol_order_items(trendyol_order_id);
create index if not exists trendyol_order_items_product_id_idx on public.trendyol_order_items(product_id);
create index if not exists trendyol_order_items_sku_idx on public.trendyol_order_items(sku);

create or replace function public.set_trendyol_order_items_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_trendyol_order_items_updated_at on public.trendyol_order_items;
create trigger set_trendyol_order_items_updated_at
before update on public.trendyol_order_items
for each row execute procedure public.set_trendyol_order_items_updated_at();

create table if not exists public.trendyol_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  error_message text,
  metadata jsonb
);

create index if not exists trendyol_webhook_events_type_idx on public.trendyol_webhook_events(event_type);
create index if not exists trendyol_webhook_events_processed_idx on public.trendyol_webhook_events(processed_at);
