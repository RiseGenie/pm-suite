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
