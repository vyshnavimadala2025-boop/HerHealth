import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Structural / source-scan tests for this migration — same constraint as
 * every other migration test in this project (no local Postgres available,
 * so the SQL body cannot be executed here). Verifies: RLS is enabled and
 * user-scoped, the plan/status/billing-interval enums are exactly what the
 * TypeScript side (subscriptionPlans.ts / types.ts) expects, the
 * updated_at trigger reuses existing infrastructure rather than
 * duplicating it, and — the property that matters most given this
 * migration intentionally allows client-side self-service writes as a
 * pre-billing placeholder — that this is documented in the file, not
 * silent.
 */

const source = readFileSync(new URL('./0042_subscriptions.sql', import.meta.url), 'utf-8')

const table = source.slice(
  source.indexOf('create table if not exists public.subscriptions'),
  source.indexOf('alter table public.subscriptions'),
)

describe('0042_subscriptions.sql — schema', () => {
  it('plan_id is constrained to exactly free and premium', () => {
    expect(table).toMatch(/check \(plan_id in \('free', 'premium'\)\)/)
  })

  it('status is constrained to the full subscription lifecycle', () => {
    expect(table).toMatch(
      /check \(status in \('free', 'trial', 'active', 'past_due', 'cancelled', 'expired'\)\)/,
    )
  })

  it('billing_interval is constrained to monthly or yearly', () => {
    expect(table).toMatch(/check \(billing_interval in \('monthly', 'yearly'\)\)/)
  })

  it('user_id references auth.users with cascade delete, matching the rest of the schema', () => {
    expect(table).toMatch(/user_id uuid primary key references auth\.users \(id\) on delete cascade/)
  })

  it('reserves stripe_customer_id / stripe_subscription_id columns for future real billing, unused today', () => {
    expect(table).toMatch(/stripe_customer_id text/)
    expect(table).toMatch(/stripe_subscription_id text/)
  })
})

describe('0042_subscriptions.sql — row level security', () => {
  it('enables RLS on the table', () => {
    expect(source).toMatch(/alter table public\.subscriptions enable row level security/)
  })

  it('every policy scopes to auth.uid() = user_id', () => {
    const policyBlocks = source.match(/create policy[\s\S]*?(?=create policy|drop trigger|$)/g) ?? []
    expect(policyBlocks.length).toBe(2)
    for (const block of policyBlocks) {
      expect(block).toMatch(/auth\.uid\(\) = user_id/)
    }
  })

  it('documents the update policy as a temporary pre-billing placeholder, not permanent design', () => {
    // The literal reason this policy exists is safety-relevant: without
    // this comment surviving future edits, someone could "clean up" what
    // looks like an odd client-writable subscriptions table without
    // realizing it must be revoked once a real payment webhook exists.
    const updatePolicyRegion = source.slice(
      source.indexOf('-- TEMPORARY, pending real billing'),
      source.indexOf('create policy "Users can update own subscription"') + 200,
    )
    expect(updatePolicyRegion).toMatch(/TEMPORARY, pending real billing/)
    expect(updatePolicyRegion).toMatch(/for update/)
  })
})

describe('0042_subscriptions.sql — reuses existing infrastructure', () => {
  it('reuses the existing set_profiles_updated_at trigger function for updated_at, rather than defining a new one', () => {
    expect(source).toMatch(/execute function public\.set_profiles_updated_at\(\)/)
  })

  it('defines exactly one new function (auto-provisioning), and does not redefine handle_new_user', () => {
    const newFunctions = source.match(/create or replace function public\.(\w+)/g) ?? []
    expect(newFunctions).toEqual(['create or replace function public.handle_new_user_subscription'])
    expect(source).not.toMatch(/create or replace function public\.handle_new_user\(/)
  })

  it('the provisioning trigger is a separate AFTER INSERT trigger on auth.users, not a modification of the existing one', () => {
    expect(source).toMatch(/create trigger on_auth_user_created_subscription\s+after insert on auth\.users/)
    expect(source).not.toMatch(/drop trigger if exists on_auth_user_created on auth\.users/)
  })
})
