alter table training_sections enable row level security;
alter table training_topics enable row level security;
alter table offers enable row level security;
alter table offer_items enable row level security;
alter table customers enable row level security;
alter table customer_notes enable row level security;
alter table sent_offers enable row level security;
alter table app_settings enable row level security;

create policy "authenticated_full_access" on training_sections
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on training_topics
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on offers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on offer_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on customers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on customer_notes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on sent_offers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on app_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
