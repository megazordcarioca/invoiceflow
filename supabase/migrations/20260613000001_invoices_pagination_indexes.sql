-- Indexes to support paginated, filtered, and sorted queries on invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_created ON invoices (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON invoices (user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_due_date ON invoices (user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_user_client_name ON invoices (user_id, client_name);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices (user_id, issue_date);
