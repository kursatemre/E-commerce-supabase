-- Add guest_id support to carts table for guest checkout

alter table public.carts
  add column if not exists guest_id text;

-- Create index for faster lookups
create index if not exists carts_guest_id_idx on public.carts(guest_id);

-- RLS policy for guest access
alter table public.carts enable row level security;

-- Allow guests to access their own carts by guest_id
create policy "guests_can_access_own_carts" on public.carts
  for select using (
    (auth.uid() IS NULL AND guest_id IS NOT NULL) OR
    (auth.uid() = user_id)
  );

create policy "guests_can_insert_carts" on public.carts
  for insert with check (
    (auth.uid() IS NULL AND guest_id IS NOT NULL) OR
    (auth.uid() = user_id)
  );

create policy "guests_can_update_carts" on public.carts
  for update using (
    (auth.uid() IS NULL AND guest_id IS NOT NULL) OR
    (auth.uid() = user_id)
  );

create policy "guests_can_delete_carts" on public.carts
  for delete using (
    (auth.uid() IS NULL AND guest_id IS NOT NULL) OR
    (auth.uid() = user_id)
  );
