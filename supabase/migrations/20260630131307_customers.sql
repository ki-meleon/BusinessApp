create table customers (
  id uuid primary key default gen_random_uuid(),
  status customer_status not null default 'lead',
  name text not null,
  company text,
  email text,
  phone text,
  address text,
  source text,
  status_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_status_idx on customers (status);

create table customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index customer_notes_customer_idx on customer_notes (customer_id, created_at desc);

create table sent_offers (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  offer_id uuid references offers(id) on delete set null,
  free_text text,
  has_audio boolean not null default false,
  webhook_url text not null,
  status sent_offer_status not null default 'pending',
  response_status_code integer,
  response_body text,
  created_at timestamptz not null default now()
);
create index sent_offers_customer_idx on sent_offers (customer_id, created_at desc);
