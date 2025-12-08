-- RLS policies for orders and order_items tables to support guest checkout

-- Enable RLS on orders table
alter table public.orders enable row level security;

-- Drop any existing policies on orders
drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can insert orders" on public.orders;
drop policy if exists "Anyone can create orders" on public.orders;
drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Users can update own orders" on public.orders;

-- Allow anyone to insert orders (guests and authenticated users)
create policy "Anyone can create orders"
on public.orders
for insert
with check (true);

-- Allow users to view their own orders
create policy "Users can view own orders"
on public.orders
for select
using (
  (auth.uid() = user_id) OR
  (guest_id IS NOT NULL)
);

-- Allow users to update their own orders
create policy "Users can update own orders"
on public.orders
for update
using (
  (auth.uid() = user_id) OR
  (guest_id IS NOT NULL)
);

-- Enable RLS on order_items table
alter table public.order_items enable row level security;

-- Drop any existing policies on order_items
drop policy if exists "Users can view their order items" on public.order_items;
drop policy if exists "Users can insert order items" on public.order_items;
drop policy if exists "Anyone can create order items" on public.order_items;
drop policy if exists "Anyone can view order items" on public.order_items;
drop policy if exists "Anyone can update order items" on public.order_items;

-- Allow anyone to insert order items
create policy "Anyone can create order items"
on public.order_items
for insert
with check (true);

-- Allow anyone to view order items
create policy "Anyone can view order items"
on public.order_items
for select
using (true);

-- Allow updates to order items
create policy "Anyone can update order items"
on public.order_items
for update
using (true);
