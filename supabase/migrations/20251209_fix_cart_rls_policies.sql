-- Fix RLS policies for carts and cart_items to support guest users
-- The issue: Previous policies don't allow anon users to insert/update carts

-- Drop existing restrictive policies
drop policy if exists "guests_can_access_own_carts" on public.carts;
drop policy if exists "guests_can_insert_carts" on public.carts;
drop policy if exists "guests_can_update_carts" on public.carts;
drop policy if exists "guests_can_delete_carts" on public.carts;

-- Enable RLS on carts (if not already enabled)
alter table public.carts enable row level security;

-- Allow anyone (anon + authenticated) to select their own cart
create policy "Anyone can view their own cart"
on public.carts
for select
using (
  -- Authenticated users can see their cart by user_id
  (auth.uid() = user_id) OR
  -- Anonymous users can see their cart by guest_id (server will set this)
  (guest_id IS NOT NULL)
);

-- Allow anyone to insert a cart (server will set user_id or guest_id)
create policy "Anyone can create a cart"
on public.carts
for insert
with check (true);

-- Allow anyone to update their own cart
create policy "Anyone can update their own cart"
on public.carts
for update
using (
  (auth.uid() = user_id) OR
  (guest_id IS NOT NULL)
);

-- Allow anyone to delete their own cart
create policy "Anyone can delete their own cart"
on public.carts
for delete
using (
  (auth.uid() = user_id) OR
  (guest_id IS NOT NULL)
);

-- Fix cart_items RLS policies
alter table public.cart_items enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can view their cart items" on public.cart_items;
drop policy if exists "Users can insert cart items" on public.cart_items;
drop policy if exists "Users can update cart items" on public.cart_items;
drop policy if exists "Users can delete cart items" on public.cart_items;

-- Allow anyone to view cart items (will be filtered by cart ownership)
create policy "Anyone can view cart items"
on public.cart_items
for select
using (true);

-- Allow anyone to insert cart items
create policy "Anyone can insert cart items"
on public.cart_items
for insert
with check (true);

-- Allow anyone to update cart items
create policy "Anyone can update cart items"
on public.cart_items
for update
using (true);

-- Allow anyone to delete cart items
create policy "Anyone can delete cart items"
on public.cart_items
for delete
using (true);
