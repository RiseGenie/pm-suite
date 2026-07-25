# PM Suite

Multi-tenant project management platform with three tiers of access:

1. **Owner (you)** — `super_admin`. Creates and manages client companies, can view/override
   anything platform-wide.
2. **Company admin** — manages their own company's team, projects, and fully customizes their
   workspace's dashboard theme (colors, fonts, corner radius, density, custom CSS).
3. **Member** — works inside their company's projects: boards, tasks, comments, attachments.

## Stack

- Next.js 14 (App Router, Server Actions, Server Components)
- Supabase (Postgres, Auth, Row Level Security, Storage)
- Tailwind CSS driven entirely by CSS custom properties, so the theme customizer can restyle
  every element live per company
- `@dnd-kit` for the drag-and-drop Kanban board

## Roles & tenancy model

- `companies` — one row per client company (tenant)
- `profiles` — extends `auth.users`, holds `role` (`super_admin` / `company_admin` / `member`)
  and `company_id`
- `company_themes` — one row per company; every editable color/font/shape lives here and is
  applied at runtime via CSS variables (`components/ThemeProvider.tsx`)
- `projects`, `tasks`, `task_comments`, `task_attachments` — all scoped to `company_id` and
  protected by Postgres Row Level Security, so one company can never see another's data
- `invites` — company admins/owner invite people by email; the invitee sets their password at
  `/join/[token]` and lands with the right role + company already attached
- `activity_log` — every meaningful action (task/project created, roles changed, invites,
  company suspended, bug reported, …) is recorded here and surfaced in the owner's activity feed
- `bug_reports` — company admins file bugs at `/admin/support`; they're emailed to the owner
  immediately and tracked to resolution at `/super-admin/bug-reports`
- `company_stats` (view) — per-company rollup (users/projects/tasks/completion/open bugs/last
  activity) powering the owner's overview table and the report generator
- `issues` — company-wide issue tracker; convertible to/from todos in either direction
  (`source_task_id` / `tasks.source_issue_id`) at `/dashboard/issues`
- `tasks.project_id` is nullable — a task with no project is a company-wide **todo**
  (`/dashboard/todos`), alongside the existing per-project Kanban boards
- `goals` — company goals with a target date and status, at `/dashboard/goals`
- `huddles` / `huddle_discussion_items` — live meeting sessions at `/dashboard/huddle`. Starting
  one opens a shared timer; anyone can pull in issues/todos/goals to discuss (with notes) or
  assign brand-new todos on the spot. Stopping it emails every active company member a recap
  (what was discussed + newly assigned todos) via Resend. Only one huddle can be active per
  company at a time (`huddles_one_active_per_company` unique index)

**The first account ever created becomes the owner (`super_admin`)** automatically (see the
`handle_new_user` trigger in `supabase/migrations/004_bootstrap_and_invites.sql`). Everyone else
must be invited.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + publishable key
npm run dev
```

## Database

All schema/RLS/storage/auth-trigger SQL lives in `supabase/migrations/`, applied in order. The
project already has this schema live in Supabase; these files are the source of truth for future
changes — apply new ones with the Supabase CLI or MCP `apply_migration`.

## Deployment

Deployed on Vercel. Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY` — invite emails, bug report notifications, and platform reports
- `OWNER_EMAIL` — where bug reports and the on-demand report default to (falls back to a
  hardcoded address if unset)
- `SUPABASE_SERVICE_ROLE_KEY` — **only** used server-side by the scheduled weekly report
  (`app/api/cron/weekly-report`), since that job runs with no logged-in user and needs to read
  across every company. Never exposed to the client.
- `CRON_SECRET` — optional; if set, Vercel Cron automatically sends it as a Bearer token and the
  route verifies it before running

## Reporting

- **On demand:** `/super-admin/reports` renders the full platform report (totals, per-company
  breakdown, recent bug reports) live, with an "Email this report to me" button.
- **Automatic:** `vercel.json` schedules `GET /api/cron/weekly-report` every Monday at 13:00 UTC,
  which emails the same report to `OWNER_EMAIL`. Requires `SUPABASE_SERVICE_ROLE_KEY` to be set
  in Vercel — without it the route no-ops safely and logs why.

## Known follow-ups

- Supabase's default email confirmation is left **on** (secure default) — new accounts must
  confirm their email before their first sign-in. Turn it off in the Supabase dashboard under
  Authentication → Providers → Email if you'd rather they get instant access.
- `next@14.2.35` is the newest Next.js 14 release; two Next.js advisories (SSRF via rewrites —
  not applicable, this app defines none — and Server Action endpoint disclosure) are only fully
  patched in Next.js 15/16, which requires the async `cookies()`/`params` API migration. Worth
  scheduling as a dedicated upgrade rather than folding into this build.
- Feature scope so far is the "Core PM" tier: projects, tasks, Kanban + list views, comments,
  attachments. Timeline/Gantt, real-time notifications, and reporting dashboards are natural
  next additions on top of this schema.
