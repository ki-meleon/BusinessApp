create table training_sections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table training_topics (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references training_sections(id) on delete cascade,
  name text not null,
  description text,
  pptx_file_path text,
  pptx_original_filename text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index training_topics_section_idx on training_topics (section_id, sort_order);
