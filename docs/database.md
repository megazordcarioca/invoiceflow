# Database Schema

Hosted on Supabase (PostgreSQL). All tables have Row Level Security (RLS) enabled — users can only access their own data.

Migration file: `supabase/migrations/20260609195000_create_core_tables.sql`

---

## Tables

### `profiles`

Extends `auth.users`. Created automatically on signup via trigger.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | References `auth.users` |
| `name` | text | User's display name |
| `company` | text | Company name (optional) |
| `created_at` | timestamptz | Auto-set |

---

### `invoices`

Invoice header with client info and lifecycle status.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Auto-generated |
| `user_id` | uuid FK | References `profiles` |
| `invoice_number` | text | Auto-assigned (INV-001, INV-002, …) |
| `client_name` | text | |
| `client_email` | text | |
| `client_address` | text | Optional |
| `issue_date` | date | |
| `due_date` | date | |
| `status` | text | `draft`, `sent`, `paid`, `overdue` |
| `notes` | text | Optional |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-updated via trigger |

---

### `invoice_line_items`

Line items belonging to an invoice. Deleted on invoice delete (cascade).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Auto-generated |
| `invoice_id` | uuid FK | References `invoices` |
| `description` | text | |
| `quantity` | numeric(12,2) | |
| `unit_price` | numeric(12,2) | |

---

### `reminders`

Tracks payment reminder emails sent for an invoice.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Auto-generated |
| `invoice_id` | uuid FK | References `invoices` |
| `sent_at` | timestamptz | Auto-set |
| `status` | text | `sent` or `failed` |

---

## Indexes

| Index | Table | Columns |
|---|---|---|
| `idx_invoices_user_id` | `invoices` | `user_id` |
| `idx_invoices_due_date_status` | `invoices` | `due_date, status` |
| `idx_invoice_line_items_invoice_id` | `invoice_line_items` | `invoice_id` |
| `idx_reminders_invoice_id` | `reminders` | `invoice_id` |

---

## Row Level Security

All tables have RLS enabled. Policies enforce user-scoped access:

| Table | Operations | Policy |
|---|---|---|
| `profiles` | SELECT, UPDATE, INSERT | `id = auth.uid()` |
| `invoices` | SELECT, INSERT, UPDATE, DELETE | `user_id = auth.uid()` |
| `invoice_line_items` | SELECT, INSERT, UPDATE, DELETE | via parent invoice's `user_id` |
| `reminders` | SELECT, INSERT | via parent invoice's `user_id` |

---

## Triggers

| Trigger | Table | Function | Effect |
|---|---|---|---|
| `set_updated_at` | `invoices` | `handle_updated_at()` | Updates `updated_at` on every row update |
| `on_auth_user_created` | `auth.users` | `handle_new_user()` | Creates `profiles` row on signup |
