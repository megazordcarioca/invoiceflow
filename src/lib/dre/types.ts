export interface DreMonthly {
  month: string;
  year: number;
  monthLabel: string;

  revenue: {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    invoiceCount: number;
  };

  previousMonth?: {
    revenue: number;
    changePercent: number;
  };
}

export interface DreSummary {
  currentMonth: DreMonthly;
  availableMonths: { year: number; month: number; label: string }[];
}
