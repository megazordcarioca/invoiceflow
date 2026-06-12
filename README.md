# InvoiceFlow

SaaS invoicing tool for freelancers and small businesses. Create, send, and track invoices with PDF export and payment reminders.

**Live app:** [invoiceflow on Vercel](https://invoiceflow.vercel.app)
**GitHub:** [megazordcarioca/invoiceflow](https://github.com/megazordcarioca/invoiceflow)

## Features

- **Invoice management** — create invoices with line items, track status (draft → sent → paid/overdue)
- **PDF export** — generate PDF invoices via pdf-lib
- **Payment reminders** — send email reminders via SMTP (nodemailer)
- **Dashboard** — summary of open, overdue, and paid invoices
- **Free tier** — 3 invoices per month per user; upgrade path at `/pricing`
- **Auth** — email/password via Supabase Auth with automatic profile creation

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend | Next.js API Routes (edge/node) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (SSR) |
| PDF | pdf-lib |
| Email | nodemailer (SMTP) |
| Deployment | Vercel |
| CI | GitHub Actions |

## Local Development

### Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Setup

```bash
git clone git@github.com:megazordcarioca/invoiceflow.git
cd invoiceflow
npm install
```

Start local Supabase:

```bash
npx supabase start
# Copy the anon key and URL from the output
```

Configure environment:

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from supabase start output
# Optionally configure SMTP_* vars for email reminders
```

Run migrations:

```bash
npx supabase db reset
```

Start the app:

```bash
npm run dev
# Open http://localhost:3000
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run format:check` | Prettier check (CI) |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `SMTP_HOST` | No | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default 587) |
| `SMTP_SECURE` | No | TLS (true/false) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From address (e.g. `InvoiceFlow <noreply@invoiceflow.app>`) |

## Deployment

The app deploys to Vercel automatically on merge to `main` via `.github/workflows/deploy.yml`. Requires `VERCEL_TOKEN` set in GitHub repository secrets.

CI runs on all PRs via `.github/workflows/ci.yml` (lint + build).

## Project Structure

```
src/
  app/
    api/           # API routes
      dashboard/   # GET summary stats
      invoices/    # CRUD + PDF + reminders
      pdf/         # PDF generation
      waitlist/    # Waitlist signup
    auth/          # Auth callback handler
    dashboard/     # Dashboard page
    invoices/      # Invoice list and detail pages
    login/         # Login page
    signup/        # Signup page
  components/      # Shared UI components
  lib/
    supabase/      # Supabase client (server + client)
  types/           # TypeScript types
supabase/
  migrations/      # SQL migration files
```

## Documentation

- [Architecture](docs/architecture.md) — system design and data flow
- [API Reference](docs/api.md) — REST API routes
- [Database Schema](docs/database.md) — tables, indexes, RLS policies
