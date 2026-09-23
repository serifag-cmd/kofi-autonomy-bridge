create table if not exists public.everest_events (
  id uuid primary key,
  type text not null,
  experiment_id text not null,
  amount_eur numeric null,
  occurred_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  source text not null default 'metrics',
  created_at timestamptz not null default now()
);

create index if not exists everest_events_experiment_idx
  on public.everest_events (experiment_id, occurred_at desc);

create index if not exists everest_events_type_idx
  on public.everest_events (type, occurred_at desc);

alter table public.everest_events enable row level security;
