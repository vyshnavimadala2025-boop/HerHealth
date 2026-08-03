drop policy if exists "Users can delete own daily checkins"
on public.daily_checkins;

create policy "Users can delete own daily checkins"
on public.daily_checkins
for delete
using (auth.uid() = user_id);
