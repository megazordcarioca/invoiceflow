export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_address: string | null;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  line_items?: LineItem[];
}

export interface InvoiceFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  issue_date: string;
  due_date: string;
  notes: string;
  line_items: LineItem[];
}
