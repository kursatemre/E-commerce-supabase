-- Fix RLS policies for products table to allow admin inserts

-- Drop existing policies if they exist
drop policy if exists "Allow public read access to active products" on public.products;
drop policy if exists "Allow authenticated users to insert products" on public.products;
drop policy if exists "Allow authenticated users to update products" on public.products;
drop policy if exists "Allow authenticated users to delete products" on public.products;

-- Create new policies
-- Public can read active products
create policy "Allow public read access to active products"
  on public.products
  for select
  to public
  using (is_active = true);

-- Authenticated users can do everything with products
create policy "Allow authenticated users full access to products"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);

-- Service role can do everything
create policy "Allow service role full access to products"
  on public.products
  for all
  to service_role
  using (true)
  with check (true);
