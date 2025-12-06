-- CRM-related enhancements for customers & orders management

alter table public.orders
  add column if not exists payment_status text not null default 'awaiting_payment',
  add column if not exists fulfillment_status text not null default 'preparing',
  add column if not exists cargo_tracking_code text,
  add column if not exists delivered_at timestamptz,
  add column if not exists invoice_number text,
  add column if not exists invoice_issued_at timestamptz;

create table if not exists public.order_documents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  document_type text not null,
  document_number text not null,
  status text not null default 'draft',
  file_url text,
  payload jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_documents_order_id_idx on public.order_documents(order_id);

create table if not exists public.order_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  notification_type text not null,
  recipient_email text not null,
  recipient_phone text,
  subject text not null,
  body text not null,
  status text not null default 'queued',
  channel text not null default 'email',
  provider_payload jsonb,
  error_code text,
  attempt_count integer not null default 0,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_notifications_order_id_idx on public.order_notifications(order_id);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text,
  address_line text not null,
  district text,
  city text not null,
  postal_code text,
  country text not null default 'Türkiye',
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists customer_addresses_user_id_idx on public.customer_addresses(user_id);
create index if not exists customer_addresses_default_idx on public.customer_addresses(user_id, is_default) where is_default;

create or replace function public.set_customer_addresses_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_customer_addresses_updated_at on public.customer_addresses;
create trigger set_customer_addresses_updated_at
before update on public.customer_addresses
for each row execute procedure public.set_customer_addresses_updated_at();

alter table public.profiles
  add column if not exists kvkk_consent boolean not null default false,
  add column if not exists sms_consent boolean not null default false;

create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  reason text,
  notes text,
  refund_amount numeric(12,2),
  metadata jsonb,
  requested_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz
);

create index if not exists return_requests_order_id_idx on public.return_requests(order_id);
create index if not exists return_requests_user_id_idx on public.return_requests(user_id);

create table if not exists public.meta_tokens (
  id uuid primary key default gen_random_uuid(),
  token_type text not null,
  access_token text not null,
  expires_at timestamptz,
  scopes text[],
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists meta_tokens_token_type_idx on public.meta_tokens(token_type);

create table if not exists public.meta_assets (
  id uuid primary key default gen_random_uuid(),
  asset_type text not null,
  external_id text not null,
  display_name text,
  status text not null default 'inactive',
  metadata jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists meta_assets_type_id_idx on public.meta_assets(asset_type, external_id);

create or replace function public.set_meta_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_meta_tokens_updated_at on public.meta_tokens;
create trigger set_meta_tokens_updated_at
before update on public.meta_tokens
for each row execute procedure public.set_meta_updated_at();

drop trigger if exists set_meta_assets_updated_at on public.meta_assets;
create trigger set_meta_assets_updated_at
before update on public.meta_assets
for each row execute procedure public.set_meta_updated_at();

create table if not exists public.google_integrations (
  id uuid primary key default gen_random_uuid(),
  integration_type text not null,
  primary_id text,
  secondary_id text,
  client_email text,
  credential jsonb,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists google_integrations_type_idx on public.google_integrations(integration_type);

drop trigger if exists set_google_integrations_updated_at on public.google_integrations;
create trigger set_google_integrations_updated_at
before update on public.google_integrations
for each row execute procedure public.set_meta_updated_at();

create table if not exists public.marketplace_integrations (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  store_name text,
  supplier_id text,
  warehouse_id text,
  api_key text,
  api_secret text,
  status text not null default 'inactive',
  metadata jsonb,
  last_sync_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists marketplace_integrations_channel_idx on public.marketplace_integrations(channel);

drop trigger if exists set_marketplace_integrations_updated_at on public.marketplace_integrations;
create trigger set_marketplace_integrations_updated_at
before update on public.marketplace_integrations
for each row execute procedure public.set_meta_updated_at();
