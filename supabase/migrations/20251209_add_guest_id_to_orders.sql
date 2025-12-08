-- Add guest_id support to orders table for guest checkout
alter table public.orders
  add column if not exists guest_id text;

-- Create index for faster lookups
create index if not exists orders_guest_id_idx on public.orders(guest_id);

-- Make user_id nullable to support guest orders
alter table public.orders
  alter column user_id drop not null;

-- Add a check constraint to ensure either user_id or guest_id is present
alter table public.orders
  add constraint orders_user_or_guest_check
  check (
    (user_id is not null) or (guest_id is not null)
  );

-- Comment for documentation
comment on constraint orders_user_or_guest_check on public.orders is
  'Ensures that an order belongs to either a registered user (user_id) or a guest (guest_id)';
