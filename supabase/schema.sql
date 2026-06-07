-- ════════════════════════════════════════════════════════════════════════════
-- Vanshika Platform — Supabase Database Schema
-- Paste this entire file into: Supabase Dashboard → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Enable UUID extension ────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── daily_messages ──────────────────────────────────────────────────────────
create table if not exists daily_messages (
  id              uuid primary key default gen_random_uuid(),
  content         text not null,
  is_published    boolean not null default false,
  is_ai_generated boolean not null default false,
  scheduled_for   timestamptz,
  mood_context    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── mood_messages ───────────────────────────────────────────────────────────
create table if not exists mood_messages (
  id              uuid primary key default gen_random_uuid(),
  mood            text not null check (mood in ('soft','tiring','chaotic','beautiful','heavy','peaceful')),
  content         text not null,
  is_published    boolean not null default false,
  is_ai_generated boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── memories ────────────────────────────────────────────────────────────────
create table if not exists memories (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  date_label    text not null,
  description   text not null,
  display_order integer not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── ai_generations (audit log) ──────────────────────────────────────────────
create table if not exists ai_generations (
  id                uuid primary key default gen_random_uuid(),
  prompt_type       text not null check (prompt_type in ('daily','mood','memory')),
  prompt_sent       text not null,
  response_received text not null,
  accepted          boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger daily_messages_updated_at
  before update on daily_messages
  for each row execute function update_updated_at_column();

create or replace trigger mood_messages_updated_at
  before update on mood_messages
  for each row execute function update_updated_at_column();

create or replace trigger memories_updated_at
  before update on memories
  for each row execute function update_updated_at_column();

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table daily_messages enable row level security;
alter table mood_messages   enable row level security;
alter table memories        enable row level security;
alter table ai_generations  enable row level security;

-- Public: read only published rows (no auth required)
create policy "public_read_daily_messages"
  on daily_messages for select
  using (is_published = true);

create policy "public_read_mood_messages"
  on mood_messages for select
  using (is_published = true);

create policy "public_read_memories"
  on memories for select
  using (is_published = true);

-- Admin: full access for authenticated users (your Supabase login)
create policy "admin_all_daily_messages"
  on daily_messages for all
  to authenticated
  using (true)
  with check (true);

create policy "admin_all_mood_messages"
  on mood_messages for all
  to authenticated
  using (true)
  with check (true);

create policy "admin_all_memories"
  on memories for all
  to authenticated
  using (true)
  with check (true);

create policy "admin_all_ai_generations"
  on ai_generations for all
  to authenticated
  using (true)
  with check (true);

-- ─── Enable Realtime ─────────────────────────────────────────────────────────
-- After running this SQL, also enable Realtime in:
-- Supabase Dashboard → Database → Replication → enable these tables
alter publication supabase_realtime add table daily_messages;
alter publication supabase_realtime add table mood_messages;
alter publication supabase_realtime add table memories;

-- ─── Seed: one published daily message so the site isn't empty ───────────────
insert into daily_messages (content, is_published, is_ai_generated)
values (
  'You are, quietly, one of the most remarkable people I''ve ever known. Not because of any single thing — but because of the way all of it adds up.',
  true,
  false
);

-- ─── Seed: mood messages ─────────────────────────────────────────────────────
insert into mood_messages (mood, content, is_published) values
('soft',      'I''m so glad. Take this gentle energy and let it carry you through the rest of your day. You deserve quiet moments that make you smile.', true),
('tiring',    'Today drained your battery, didn''t it? Put the day behind you and rest properly tonight. The world can wait for tomorrow.', true),
('chaotic',   'Let this space be your quiet anchor. Take a deep breath — the chaos is temporary, and you''ve made it through all of it.', true),
('beautiful', 'I love that today was beautiful. Keep that glow with you. I hope it rolls softly into tomorrow.', true),
('heavy',     'If today felt heavy, let me carry a small part of it for you. Sleep early tonight and give your mind the rest it deserves.', true),
('peaceful',  'A peaceful mind is such a rare, sweet treasure. Enjoy the quiet evening, and remember how valuable these calm days truly are.', true);

-- ─── Seed: memories ──────────────────────────────────────────────────────────
insert into memories (title, date_label, description, display_order, is_published) values
('How We Met',       'The Spark',      'A simple conversation that turned into hours of shared laughter and instant, effortless connection.', 1, true),
('Our First Walk',   'The Beginning',  'Quiet afternoon walks and warm conversations, where time felt like it stood completely still.', 2, true),
('Late Night Talks', 'Deep Nights',    'When the rest of the world slept, we built our own calm universe through words alone.', 3, true),
('That Random Laugh','Sweet Moments',  'A completely spontaneous joke that reminded me how beautiful your laugh sounds.', 4, true),
('Ordinary Tuesdays','Every Day',      'The days when nothing special happened, but everything felt right because you were there.', 5, true);

-- ─── love_vouchers ───────────────────────────────────────────────────────────
create table if not exists love_vouchers (
  id          text primary key,
  title       text not null,
  description text,
  category    text not null default 'coupon', -- 'coupon', 'challenge', 'vow', 'activity'
  status      text not null default 'active', -- 'active', 'claimed', 'redeemed'
  emoji       text default '🎫',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Enable RLS
alter table love_vouchers enable row level security;

-- Public Select
create policy "public_read_love_vouchers"
  on love_vouchers for select
  using (true);

-- Public insert/update/delete (or admin all using true for simple management)
create policy "public_all_love_vouchers"
  on love_vouchers for all
  using (true)
  with check (true);

-- Enable Realtime
alter publication supabase_realtime add table love_vouchers;

-- Seed initial love vouchers
insert into love_vouchers (id, title, description, category, status, emoji) values
('v1', 'Midnight Ice Cream Run', 'Redeem this for a late-night drive to grab your favorite double chocolate scoop!', 'coupon', 'active', '🍦'),
('v2', 'No-Phone Date Night', 'A full dinner date where both of our phones stay completely face-down and silent.', 'challenge', 'active', '🚫📱'),
('v3', 'Yes Day for 1 Hour', 'For one whole hour, I will agree to absolutely any cute favor or request you make.', 'coupon', 'active', '👑'),
('v4', 'To always make you laugh', 'A cozy lifelong promise to find ways to make you giggle, even on tiring Tuesdays.', 'vow', 'active', '😂');


-- ════════════════════════════════════════════════════════════════════════════
-- MIGRATION v2 — Extended tables for full platform
-- ════════════════════════════════════════════════════════════════════════════

-- ─── reminders ───────────────────────────────────────────────────────────────
create table if not exists reminders (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  event_type      text not null default 'special'
                    check (event_type in ('anniversary','birthday','special','custom')),
  event_date      date not null,
  emotional_note  text,
  priority        text not null default 'medium'
                    check (priority in ('high','medium','low')),
  is_ai_suggested boolean not null default false,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table reminders enable row level security;
create policy "public_read_reminders"   on reminders for select using (is_published = true);
create policy "admin_all_reminders"     on reminders for all to authenticated using (true) with check (true);
create or replace trigger reminders_updated_at before update on reminders for each row execute function update_updated_at_column();

-- ─── date_plans ──────────────────────────────────────────────────────────────
create table if not exists date_plans (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  plan_date       date,
  plan_time       text,
  place           text,
  mood            text default 'romantic'
                    check (mood in ('romantic','cozy','surprise','elegant','casual','long-drive','movie','cafe')),
  activity        text,
  budget          text,
  notes           text,
  checklist       jsonb not null default '[]',
  is_published    boolean not null default false,
  is_ai_enhanced  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table date_plans enable row level security;
create policy "public_read_date_plans"  on date_plans for select using (is_published = true);
create policy "admin_all_date_plans"    on date_plans for all to authenticated using (true) with check (true);
create or replace trigger date_plans_updated_at before update on date_plans for each row execute function update_updated_at_column();

-- ─── love_notes ──────────────────────────────────────────────────────────────
create table if not exists love_notes (
  id              uuid primary key default gen_random_uuid(),
  title           text,
  content         text not null,
  category        text not null default 'letter'
                    check (category in ('letter','reason','micro-note','vow')),
  mood_tag        text,
  is_published    boolean not null default false,
  is_ai_generated boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table love_notes enable row level security;
create policy "public_read_love_notes"  on love_notes for select using (is_published = true);
create policy "admin_all_love_notes"    on love_notes for all to authenticated using (true) with check (true);
create or replace trigger love_notes_updated_at before update on love_notes for each row execute function update_updated_at_column();

-- ─── music_tracks ────────────────────────────────────────────────────────────
create table if not exists music_tracks (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  artist          text,
  youtube_id      text,
  thumbnail_url   text,
  mood_tag        text,
  is_featured     boolean not null default false,
  display_order   integer not null default 0,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table music_tracks enable row level security;
create policy "public_read_music_tracks"  on music_tracks for select using (is_published = true);
create policy "admin_all_music_tracks"    on music_tracks for all to authenticated using (true) with check (true);
create or replace trigger music_tracks_updated_at before update on music_tracks for each row execute function update_updated_at_column();

-- ─── gallery_items ───────────────────────────────────────────────────────────
create table if not exists gallery_items (
  id              uuid primary key default gen_random_uuid(),
  caption         text,
  image_url       text not null,
  date_label      text,
  display_order   integer not null default 0,
  is_featured     boolean not null default false,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table gallery_items enable row level security;
create policy "public_read_gallery_items"  on gallery_items for select using (is_published = true);
create policy "admin_all_gallery_items"    on gallery_items for all to authenticated using (true) with check (true);

-- ─── site_settings (single-row config) ───────────────────────────────────────
create table if not exists site_settings (
  id                uuid primary key default gen_random_uuid(),
  welcome_text      text not null default 'For You, Vanshika',
  countdown_date    date,
  countdown_label   text not null default 'Days until our next chapter',
  sections_visible  jsonb not null default '{
    "hero":true,"dailyNote":true,"mood":true,"memories":true,
    "gallery":true,"music":true,"dateplan":true,"lovenotes":true,
    "vouchers":true,"countdown":true,"reminders":true
  }',
  updated_at        timestamptz not null default now()
);
create or replace trigger site_settings_updated_at before update on site_settings for each row execute function update_updated_at_column();
alter table site_settings enable row level security;
create policy "public_read_site_settings" on site_settings for select using (true);
create policy "admin_all_site_settings"   on site_settings for all to authenticated using (true) with check (true);

-- Seed a default site_settings row
insert into site_settings (welcome_text, countdown_label) values
  ('For You, Vanshika', 'Days until our next chapter')
on conflict do nothing;

-- ─── Enable Realtime for new tables ──────────────────────────────────────────
alter publication supabase_realtime add table reminders;
alter publication supabase_realtime add table date_plans;
alter publication supabase_realtime add table love_notes;
alter publication supabase_realtime add table music_tracks;
alter publication supabase_realtime add table gallery_items;
alter publication supabase_realtime add table site_settings;
