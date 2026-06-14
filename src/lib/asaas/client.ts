const ASAAS_API_URL = process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

const apiKeyMissing = !ASAAS_API_KEY;

async function asaasFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${ASAAS_API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Asaas API error ${res.status}: ${body}`);
  }

  return res.json();
}

export async function createCustomer(name: string, email: string, cpfCnpj?: string) {
  const body: Record<string, unknown> = { name, email };
  if (cpfCnpj) body.cpfCnpj = cpfCnpj;
  return asaasFetch<{ id: string }>("/customers", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function findCustomerByEmail(email: string) {
  const data = await asaasFetch<{ data: { id: string; name: string; email: string }[] }>(
    `/customers?email=${encodeURIComponent(email)}`
  );
  return data.data?.[0] || null;
}

export async function createSubscription(params: {
  customerId: string;
  value: number;
  nextDueDate: string;
  cycle: "MONTHLY";
  billingType: "CREDIT_CARD" | "BOLETO" | "PIX";
  description?: string;
}) {
  return asaasFetch<{ id: string; status: string }>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: params.customerId,
      value: params.value,
      nextDueDate: params.nextDueDate,
      cycle: params.cycle,
      billingType: params.billingType,
      description: params.description,
    }),
  });
}

export async function getSubscription(id: string) {
  return asaasFetch<{
    id: string;
    customer: string;
    value: number;
    status: string;
    nextDueDate: string;
  }>(`/subscriptions/${id}`);
}

export async function cancelSubscription(id: string) {
  return asaasFetch<{ id: string; status: string }>(`/subscriptions/${id}`, {
    method: "DELETE",
  });
}

export async function listPayments(subscriptionId: string) {
  const data = await asaasFetch<{
    data: { id: string; status: string; invoiceUrl?: string; value: number }[];
  }>(`/payments?subscription=${subscriptionId}`);
  return data.data;
}

export function isApiKeyMissing() {
  return apiKeyMissing;
}

export function getSandboxUrl() {
  if (ASAAS_API_URL.includes("sandbox")) {
    return "https://sandbox.asaas.com";
  }
  return "https://www.asaas.com";
}
