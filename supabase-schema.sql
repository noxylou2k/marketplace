-- Marketplace schema for Supabase.
-- In the Supabase SQL editor, run this file once, then set:
--   NEXT_PUBLIC_SUPABASE_URL
--   NEXT_PUBLIC_SUPABASE_ANON_KEY

create extension if not exists "pgcrypto";

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  category text not null,
  location text not null default '',
  seller_name text not null default '',
  seller_email text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  buyer_email text not null,
  seller_email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists listings_category_idx on listings (category);
create index if not exists listings_created_at_idx on listings (created_at desc);
create index if not exists messages_listing_idx on messages (listing_id);

alter table listings enable row level security;
alter table messages enable row level security;

drop policy if exists "Public read listings" on listings;
create policy "Public read listings"
  on listings for select
  to anon, authenticated
  using (true);

drop policy if exists "Public insert listings" on listings;
create policy "Public insert listings"
  on listings for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public read messages" on messages;
create policy "Public read messages"
  on messages for select
  to anon, authenticated
  using (true);

drop policy if exists "Public insert messages" on messages;
create policy "Public insert messages"
  on messages for insert
  to anon, authenticated
  with check (true);

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read listing images" on storage.objects;
create policy "Public read listing images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'listing-images');

drop policy if exists "Public upload listing images" on storage.objects;
create policy "Public upload listing images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'listing-images');
