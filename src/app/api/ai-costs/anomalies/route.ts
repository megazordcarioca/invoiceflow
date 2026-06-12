import { NextResponse } from "next/server";
import { detectAnomalies, formatAnomalyReport } from "@/lib/ai-costs";

export async function GET() {
  try {
    const report = await detectAnomalies();
    return NextResponse.json(report);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to detect anomalies", details: String(err) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const report = await detectAnomalies();
    const formatted = formatAnomalyReport(report);
    return NextResponse.json({ report, formatted });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to generate anomaly report", details: String(err) },
      { status: 500 }
    );
  }
}
