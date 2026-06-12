# API Reference

All routes require an authenticated Supabase session (cookie). Unauthenticated requests return `401 Unauthorized`.

Base path: `/api`

---

## Dashboard

### `GET /api/dashboard`

Returns summary statistics for the authenticated user.

**Response**

```json
{
  "total": 10,
  "draft": 2,
  "sent": 3,
  "paid": 4,
  "overdue": 1,
  "totalRevenue": 12500.00,
  "overdueAmount": 1200.00
}
```

---

## Invoices

### `GET /api/invoices`

List all invoices for the authenticated user, ordered by `created_at` descending.

**Response** — array of invoice objects.

---

### `POST /api/invoices`

Create a new invoice. Enforces free-tier limit (3/month).

**Request body**

```json
{
  "client_name": "Acme Corp",
  "client_email": "billing@acme.com",
  "client_address": "123 Main St",
  "issue_date": "2026-06-01",
  "due_date": "2026-06-30",
  "notes": "Net 30",
  "line_items": [
    { "description": "Design work", "quantity": 10, "unit_price": 150.00 }
  ]
}
```

**Response** `201 Created` — full invoice with `invoice_line_items`.

**Error** `403 Forbidden` — free tier limit reached:

```json
{
  "error": "Free tier limit reached",
  "limit": 3,
  "current": 3,
  "remaining": 0,
  "upgradeUrl": "/pricing"
}
```

---

### `GET /api/invoices/{id}`

Get a single invoice with line items.

---

### `PATCH /api/invoices/{id}`

Update invoice fields (status, notes, dates, client info).

---

### `DELETE /api/invoices/{id}`

Delete an invoice and its line items (cascade).

---

### `POST /api/invoices/{id}/pay`

Mark invoice as `paid`.

---

### `POST /api/invoices/{id}/reminders`

Send a payment reminder email to the client. Logs outcome in `reminders` table.

**Response** `200 OK` on success, `500` if SMTP fails.

---

## PDF

### `GET /api/pdf?invoiceId={id}`

Generate and download a PDF for the given invoice.

**Response** — `application/pdf` with `Content-Disposition: attachment; filename="INV-001.pdf"`.

---

## Waitlist

### `POST /api/waitlist`

Add an email to the waitlist.

**Request body**

```json
{ "email": "user@example.com" }
```

**Response** `200 OK`.
