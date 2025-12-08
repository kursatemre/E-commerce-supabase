-- Make user_id nullable in carts table to support guest checkout
-- Guest users will have null user_id but will have a guest_id instead

alter table public.carts
  alter column user_id drop not null;

-- Add a check constraint to ensure either user_id or guest_id is present
alter table public.carts
  add constraint carts_user_or_guest_check
  check (
    (user_id is not null) or (guest_id is not null)
  );

-- Add comment for documentation
comment on constraint carts_user_or_guest_check on public.carts is
  'Ensures that a cart belongs to either a registered user (user_id) or a guest (guest_id)';
