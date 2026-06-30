create table app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into app_settings (key, value) values
  ('n8n_webhook_send_offer', ''),
  ('pptx_storage_dir', '');
