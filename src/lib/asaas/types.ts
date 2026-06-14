export type AsaasPlan = "free" | "pro" | "business";

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: "CREDIT_CARD" | "BOLETO" | "PIX";
  value: number;
  nextDueDate: string;
  cycle: "MONTHLY";
  status: "ACTIVE" | "CANCELED" | "OVERDUE" | "INACTIVE" | "EXPIRED";
}

export interface AsaasPayment {
  id: string;
  subscription: string;
  customer: string;
  billingType: "CREDIT_CARD" | "BOLETO" | "PIX";
  value: number;
  dueDate: string;
  status: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "CANCELED";
  invoiceUrl?: string;
}

export interface AsaasWebhookEvent {
  event:
    | "PAYMENT_RECEIVED"
    | "PAYMENT_CONFIRMED"
    | "PAYMENT_OVERDUE"
    | "PAYMENT_REFUNDED"
    | "PAYMENT_CANCELED"
    | "SUBSCRIPTION_CANCELED";
  payment?: AsaasPayment;
  subscription?: AsaasSubscription;
}

export interface AsaasCheckoutResponse {
  url: string;
  subscriptionId: string;
}
