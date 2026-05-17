


create extension if not exists "uuid-ossp";


create table if not exists meters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  meter_number text not null,
  nickname text not null,
  disco text not null,
  meter_type text not null default 'single-phase',
  alert_threshold numeric not null default 10,
  created_at timestamptz default now()
);

create table if not exists recharge_logs (
  id uuid primary key default uuid_generate_v4(),
  meter_id uuid references meters(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  amount_naira numeric not null,
  units_kwh numeric not null,
  notes text,
  created_at timestamptz default now()
);


alter table meters enable row level security;
alter table recharge_logs enable row level security;

create policy "Users manage own meters"
  on meters for all using (auth.uid() = user_id);

create policy "Users manage own logs"
  on recharge_logs for all using (auth.uid() = user_id);


create index if not exists idx_meters_user on meters(user_id);
create index if not exists idx_logs_meter on recharge_logs(meter_id);
create index if not exists idx_logs_user on recharge_logs(user_id);
