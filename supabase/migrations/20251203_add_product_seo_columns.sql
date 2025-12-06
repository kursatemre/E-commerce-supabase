-- Adds SEO fields to products table for admin panel configuration
alter table public.products
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists seo_keywords text,
  add column if not exists seo_canonical_url text,
  add column if not exists seo_robots text;
