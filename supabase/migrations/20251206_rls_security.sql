-- RLS (Row Level Security) policies for sensitive integrations

-- Enable RLS on sensitive tables
alter table public.google_integrations enable row level security;
alter table public.marketplace_integrations enable row level security;
alter table public.meta_tokens enable row level security;
alter table public.meta_assets enable row level security;
alter table public.trendyol_products enable row level security;
alter table public.trendyol_orders enable row level security;
alter table public.trendyol_order_items enable row level security;
alter table public.trendyol_sync_runs enable row level security;
alter table public.trendyol_webhook_events enable row level security;

-- Google Integrations: Only service role can access (backend only)
drop policy if exists "Service role full access to google_integrations" on public.google_integrations;
create policy "Service role full access to google_integrations"
on public.google_integrations
for all
to service_role
using (true)
with check (true);

-- Marketplace Integrations: Only service role can access
drop policy if exists "Service role full access to marketplace_integrations" on public.marketplace_integrations;
create policy "Service role full access to marketplace_integrations"
on public.marketplace_integrations
for all
to service_role
using (true)
with check (true);

-- Meta Tokens: Only service role can access (contains sensitive API tokens)
drop policy if exists "Service role full access to meta_tokens" on public.meta_tokens;
create policy "Service role full access to meta_tokens"
on public.meta_tokens
for all
to service_role
using (true)
with check (true);

-- Meta Assets: Service role full access, authenticated users can read only
drop policy if exists "Service role full access to meta_assets" on public.meta_assets;
create policy "Service role full access to meta_assets"
on public.meta_assets
for all
to service_role
using (true)
with check (true);

drop policy if exists "Authenticated users can read meta_assets" on public.meta_assets;
create policy "Authenticated users can read meta_assets"
on public.meta_assets
for select
to authenticated
using (true);

-- Trendyol Products: Service role can modify, authenticated can read
drop policy if exists "Service role full access to trendyol_products" on public.trendyol_products;
create policy "Service role full access to trendyol_products"
on public.trendyol_products
for all
to service_role
using (true)
with check (true);

drop policy if exists "Authenticated users can read trendyol_products" on public.trendyol_products;
create policy "Authenticated users can read trendyol_products"
on public.trendyol_products
for select
to authenticated
using (true);

-- Trendyol Orders: Service role can modify, authenticated can read
drop policy if exists "Service role full access to trendyol_orders" on public.trendyol_orders;
create policy "Service role full access to trendyol_orders"
on public.trendyol_orders
for all
to service_role
using (true)
with check (true);

drop policy if exists "Authenticated users can read trendyol_orders" on public.trendyol_orders;
create policy "Authenticated users can read trendyol_orders"
on public.trendyol_orders
for select
to authenticated
using (true);

-- Trendyol Order Items: Service role can modify, authenticated can read
drop policy if exists "Service role full access to trendyol_order_items" on public.trendyol_order_items;
create policy "Service role full access to trendyol_order_items"
on public.trendyol_order_items
for all
to service_role
using (true)
with check (true);

drop policy if exists "Authenticated users can read trendyol_order_items" on public.trendyol_order_items;
create policy "Authenticated users can read trendyol_order_items"
on public.trendyol_order_items
for select
to authenticated
using (true);

-- Trendyol Sync Runs: Service role can modify, authenticated can read
drop policy if exists "Service role full access to trendyol_sync_runs" on public.trendyol_sync_runs;
create policy "Service role full access to trendyol_sync_runs"
on public.trendyol_sync_runs
for all
to service_role
using (true)
with check (true);

drop policy if exists "Authenticated users can read trendyol_sync_runs" on public.trendyol_sync_runs;
create policy "Authenticated users can read trendyol_sync_runs"
on public.trendyol_sync_runs
for select
to authenticated
using (true);

-- Trendyol Webhook Events: Only service role (contains raw payloads)
drop policy if exists "Service role full access to trendyol_webhook_events" on public.trendyol_webhook_events;
create policy "Service role full access to trendyol_webhook_events"
on public.trendyol_webhook_events
for all
to service_role
using (true)
with check (true);

-- Admin function to check if user is admin (useful for future admin-only policies)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Grant execute permission on is_admin function
grant execute on function public.is_admin() to authenticated;

-- Comments for documentation
comment on policy "Service role full access to google_integrations" on public.google_integrations is
  'Only backend service can read/write Google credentials including private keys';

comment on policy "Service role full access to meta_tokens" on public.meta_tokens is
  'Only backend service can access Meta API tokens to prevent token leakage';

comment on policy "Service role full access to trendyol_webhook_events" on public.trendyol_webhook_events is
  'Webhook events contain raw payloads that may include sensitive data';
