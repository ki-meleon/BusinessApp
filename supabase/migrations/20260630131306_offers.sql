create table offers (
  id uuid primary key default gen_random_uuid(),
  category offer_category not null,
  name text not null,
  description text,
  price_cents integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index offers_category_sort_idx on offers (category, sort_order);

create table offer_items (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  label text not null,
  topic_id uuid references training_topics(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index offer_items_offer_idx on offer_items (offer_id, sort_order);
