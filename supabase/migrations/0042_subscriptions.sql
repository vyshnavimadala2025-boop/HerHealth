-- SIRILA — Subscription system: per-user plan/status record.
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- SCOPE AND HONESTY NOTE: no payment processor (Stripe or otherwise) is
-- integrated in this codebase yet — package.json has no billing SDK. This
-- migration models the real, durable state a subscription system needs
-- (which plan, which lifecycle status, when the current period ends,
-- whether a cancellation is pending) so the rest of the app can gate
-- features on it today, while leaving the two columns a real payment
-- webhook would eventually populate (stripe_customer_id,
-- stripe_subscription_id) present but unused. Until real billing exists,
-- rows are written by authenticated self-service actions (see the "Users
-- can update own subscription" policy below) — effectively a manual
-- "activate premium" switch, not a real purchase. That policy is the one
-- thing that MUST change when real billing is wired up: a payment webhook
-- runs as a Supabase Edge Function using the service-role key (which
-- bypasses RLS entirely), so client-side UPDATE access should be revoked
-- at that point to prevent a user granting themselves premium for free.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_id text not null default 'free'
    constraint subscriptions_plan_id_check check (plan_id in ('free', 'premium')),
  status text not null default 'free'
    constraint subscriptions_status_check
    check (status in ('free', 'trial', 'active', 'past_due', 'cancelled', 'expired')),
  billing_interval text
    constraint subscriptions_billing_interval_check check (billing_interval in ('monthly', 'yearly')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  -- Populated by a future real payment integration; unused today.
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- TEMPORARY, pending real billing (see note above): lets the self-service
-- "activate premium" UI action write its own row. A real payment webhook
-- would instead run as a service-role Edge Function, which bypasses RLS —
-- at that point this policy should be dropped so no client can grant
-- itself premium directly.
create policy "Users can update own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Reuses the same trigger function profiles already defined in
-- 0001_profiles.sql (it only ever touches NEW.updated_at, nothing
-- profiles-specific) rather than duplicating it — same reuse already
-- established by 0041_interaction_intelligence.sql for interaction_baseline.
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_profiles_updated_at();

-- Create a default free subscription row automatically whenever a new
-- auth user is created — deliberately a SEPARATE trigger function from
-- profiles' own handle_new_user() (0001_profiles.sql), not a modification
-- of it, so this migration cannot affect existing signup/profile-creation
-- behavior. Postgres fires both AFTER INSERT triggers on auth.users
-- independently for the same row.
create or replace function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_subscription on auth.users;

create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row
  execute function public.handle_new_user_subscription();
