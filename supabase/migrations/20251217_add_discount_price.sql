-- Add discount_price column to products table
alter table public.products
  add column if not exists discount_price numeric(10, 2) check (discount_price >= 0);

-- Add discount_price column to product_variants table
alter table public.product_variants
  add column if not exists discount_price numeric(10, 2) check (discount_price >= 0);

-- Add comment
comment on column public.products.discount_price is 'Discounted price for the product. If set, this price will be shown instead of regular price with discount badge.';
comment on column public.product_variants.discount_price is 'Discounted price for the variant. If set, this price will be shown instead of regular variant price with discount badge.';
