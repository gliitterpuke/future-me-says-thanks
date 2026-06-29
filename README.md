# future me says thanks

A tiny shared daily tracker for a group of friends. Log healthy eating, a
workout, and a walk each day; compete on a leaderboard.

## Scoring

| Action            | Girls            | Guys      |
| ----------------- | ---------------- | --------- |
| Eat healthy       | 1 pt             | 1 pt      |
| Workout           | 15m=1pt, 45m=2pt | 30m = 1pt |
| Walk              | 5k steps = 1pt   | 10k = 1pt |

- **Max 3 points / day.** Workout tiers don't stack (no 15m + 45m).

## The challenge

It's a **30-day challenge**: the goal is 30 *non-exempt* days. An **exempt day**
(sick / period) doesn't consume one of your 30 days — so each one effectively
adds a calendar day, pushing your finish line out ("+1 day"). A normal day
always counts, even a 0-point one; only sick/period are excused. The leaderboard
ranks by total points (out of 30 × 3 = 90).

Set the start date in [`lib/challenge.ts`](lib/challenge.ts) (`CHALLENGE.start`).
Everyone shares one start date, so start the group together.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free
   tier is plenty for ~20 people).
2. **Run the schema:** open Supabase → SQL Editor → paste
   [`supabase/schema.sql`](supabase/schema.sql) → Run.
   - _Already set up an earlier version?_ Run the incremental migrations instead:
     [`supabase/add_notes.sql`](supabase/add_notes.sql) (private notes) and
     [`supabase/add_avatars.sql`](supabase/add_avatars.sql) (emoji avatars).
3. **Auth redirect URLs:** Supabase → Authentication → URL Configuration. Add
   `http://localhost:3000/**` for local dev and your deployed URL (e.g.
   `https://your-app.vercel.app/**`) once live.
4. **Env vars:** copy `.env.local.example` to `.env.local` and fill in
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase →
   Project Settings → API).
5. Install + run:
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000, sign in with the magic link, pick your name +
   scoring profile, and start tapping days.

## Deploy

Push to GitHub and import into [Vercel](https://vercel.com). Add the same two
env vars in the Vercel project settings, and add your Vercel URL to the
Supabase redirect allow-list (step 3).

Auth is passwordless magic links. Anyone who signs in joins the same shared
group and shows up on the leaderboard.
