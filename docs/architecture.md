# Architecture

## Overview

InvoiceFlow is a multi-tenant SaaS invoicing app. Each user manages their own invoices in complete isolation enforced at the database layer via Row Level Security (RLS). The app follows a Next.js App Router pattern: server components handle data fetching, client components handle interactivity.

## System Diagram

```
Browser
  │
  ├─ Next.js App Router (Vercel)
  │     ├─ /dashboard         — server component, reads from Supabase
  │     ├─ /invoices          — server + client components
  │     ├─ /login, /signup    — auth forms
  │     └─ /api/*             — REST API routes (Node.js runtime)
  │
  └─ Supabase
        ├─ Auth               — email/password, session cookies (SSR)
        └─ PostgreSQL          — profiles, invoices, line items, reminders
```

## Auth Flow

1. User signs up at `/signup` → Supabase creates `auth.users` record
2. Database trigger `on_auth_user_created` inserts a row into `public.profiles`
3. Session stored as cookie via `@supabase/ssr`
4. Middleware (`src/middleware.ts`) validates session and redirects unauthenticated requests to `/login`
5. Server-side Supabase client reads session from cookie on each request

## Data Flow — Invoice Creation

```
Client POST /api/invoices
  │
  ├─ Validate session (Supabase server client)
  ├─ Check free-tier limit (3 invoices/month per user)
  ├─ Auto-generate invoice number (INV-001, INV-002, …)
  ├─ INSERT into invoices
  ├─ INSERT into invoice_line_items
  └─ Return full invoice with line items
```

## PDF Generation

`GET /api/pdf?invoiceId={id}` fetches invoice + line items from Supabase, renders a PDF using `pdf-lib`, and returns it as `application/pdf` with `Content-Disposition: attachment`.

## Email Reminders

`POST /api/invoices/{id}/reminders` sends a payment reminder email to the client via SMTP (nodemailer). The reminder is logged in the `reminders` table with `sent` or `failed` status. No background jobs — reminders are sent synchronously on API call.

## Free Tier Enforcement

The `POST /api/invoices` route counts invoices created in the current calendar month for the authenticated user. If the count is ≥ 3, it returns `403 Forbidden` with upgrade info pointing to `/pricing`.

## Gitflow

- `main` — production branch; merges trigger Vercel deployment
- `develop` — integration branch; PRs target `develop`, merge to `main` for releases
- Feature branches: `feature/*`

## CI/CD

| Workflow | Trigger | Steps |
|---|---|---|
| `ci.yml` | Push / PR to any branch | Install → lint → build |
| `deploy.yml` | Push to `main` | Install → build → Vercel deploy |
