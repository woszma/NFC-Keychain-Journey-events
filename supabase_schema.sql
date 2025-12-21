-- Supabase Schema for NFC Keychain Journey
-- 按順序建立所有表（確保外鍵依賴正確）

-- ============================================
-- 1. keychains - 實體鎖匙扣記錄（基礎表）
-- ============================================
create table if not exists keychains (
  id text primary key,
  created_at timestamp with time zone default now(),
  current_owner text,
  status text default 'active' -- 'active' / 'inactive' / 'archived'
);

-- ============================================
-- 2. prompts - 指令樣板庫（基礎表）
-- ============================================
create table if not exists prompts (
  id bigint primary key generated always as identity,
  prompt_key text unique not null,
  prompt_text text not null,
  created_at timestamp with time zone default now()
);

-- ============================================
-- 3. events - 轉移事件紀錄（主表）
-- ============================================
create table if not exists events (
  id bigint primary key generated always as identity,
  keychain_id text not null,
  timestamp bigint not null,
  from_name text not null,
  to_name text not null,
  prompt_key text,
  prompt_text text,
  next_prompt_key text,
  next_prompt_text text,
  created_at timestamp with time zone default now(),
  
  foreign key (keychain_id) references keychains(id),
  foreign key (prompt_key) references prompts(prompt_key)
);

create index if not exists idx_events_keychain on events(keychain_id);
create index if not exists idx_events_timestamp on events(timestamp);

-- ============================================
-- 4. blessings - 祝福 UGC（功能 A）
-- ============================================
create table if not exists blessings (
  id bigint primary key generated always as identity,
  keychain_id text not null,
  station_number int not null,
  quest_tag text,
  blessing_text text not null,
  code_phrase text,
  optional_note text,
  visibility text default 'Private', -- 'Private' / 'Public'
  created_at timestamp with time zone default now(),
  created_by text,
  reported_count int default 0,
  is_hidden boolean default false,
  
  foreign key (keychain_id) references keychains(id),
  check (char_length(blessing_text) <= 15),
  check (char_length(code_phrase) <= 10),
  check (char_length(optional_note) <= 120)
);

create index if not exists idx_blessings_keychain on blessings(keychain_id);
create index if not exists idx_blessings_station on blessings(keychain_id, station_number);

-- ============================================
-- 5. reports - 舉報紀錄（功能 A）
-- ============================================
create table if not exists reports (
  id bigint primary key generated always as identity,
  blessing_id bigint not null,
  reason text not null,
  reported_by text,
  created_at timestamp with time zone default now(),
  status text default 'Pending', -- 'Pending' / 'Reviewed' / 'Dismissed'
  admin_notes text,
  resolved_at timestamp with time zone,
  
  foreign key (blessing_id) references blessings(id) on delete cascade
);

create index if not exists idx_reports_blessing on reports(blessing_id);
create index if not exists idx_reports_status on reports(status);

-- ============================================
-- 6. elephant_reactions - 小將回應句庫（功能 D）
-- ============================================
create table if not exists elephant_reactions (
  id bigint primary key generated always as identity,
  reaction_text text not null,
  category text, -- 'Blessing' / 'Encouragement' / 'Resonance' / 'Ritual'
  type text, -- 'Emotion' / 'Ritual' / 'Gratitude'
  status text default 'Active', -- 'Active' / 'Archived'
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by text,
  
  check (char_length(reaction_text) <= 50)
);

create index if not exists idx_reactions_status on elephant_reactions(status);
create index if not exists idx_reactions_category on elephant_reactions(category);

-- ============================================
-- 7. feedback - 開發者回饋（功能 C）
-- ============================================
create table if not exists feedback (
  id bigint primary key generated always as identity,
  category text not null, -- 'Bug' / 'Suggestion' / 'Copy' / 'Other'
  message text not null,
  screenshot_url text,
  user_email text,
  app_version text,
  os_type text, -- 'iOS' / 'Android' / 'Web'
  feedback_timestamp bigint,
  journey_id text,
  created_at timestamp with time zone default now(),
  status text default 'Pending', -- 'Pending' / 'Reviewed' / 'Actioned'
  admin_notes text,
  
  check (char_length(message) <= 200)
);

create index if not exists idx_feedback_category on feedback(category);
create index if not exists idx_feedback_status on feedback(status);
create index if not exists idx_feedback_created on feedback(created_at);

-- ============================================
-- 8. share_events - 分享事件日誌（功能 B，可選）
-- ============================================
create table if not exists share_events (
  id bigint primary key generated always as identity,
  journey_id text not null,
  shared_via text, -- 'Facebook' / 'WhatsApp' / 'Email' / 'Other'
  toggle_states jsonb, -- { from_alias_visible, my_name_visible, blessings_visible }
  created_at timestamp with time zone default now(),
  
  foreign key (journey_id) references keychains(id)
);

create index if not exists idx_share_events_journey on share_events(journey_id);

-- ============================================
-- 初始化：插入範例 elephant_reactions
-- ============================================
insert into elephant_reactions (reaction_text, category, type, status)
values
  ('謝謝你的信任，祝福一路同行。', 'Blessing', 'Gratitude', 'Active'),
  ('你的故事讓人看到溫暖的力量。', 'Encouragement', 'Emotion', 'Active'),
  ('每一次傳遞都是一份承諾。', 'Ritual', 'Ritual', 'Active'),
  ('在這一站，我們都被看見了。', 'Resonance', 'Emotion', 'Active'),
  ('感謝你選擇分享，讓我認識你。', 'Blessing', 'Gratitude', 'Active'),
  ('這個時刻，成為永恆的記憶。', 'Ritual', 'Emotion', 'Active'),
  ('善良會在下一站延續。', 'Encouragement', 'Emotion', 'Active'),
  ('你的名字，被旅程記住了。', 'Resonance', 'Gratitude', 'Active'),
  ('一個擁抱，跨越千里。', 'Blessing', 'Emotion', 'Active'),
  ('在乎，就是最好的回應。', 'Encouragement', 'Emotion', 'Active')
on conflict do nothing;